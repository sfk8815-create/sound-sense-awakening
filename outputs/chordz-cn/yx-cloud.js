/* ============================================================
   音感觉醒 · 云端账号与数据同步  (yx-cloud.js)
   ------------------------------------------------------------
   · 账号：邮箱验证码登录 / 邮箱密码登录 / 邮箱注册 / 找回密码 / 退出
   · 数据：把本机 localStorage 中的练习进度镜像到云端，换设备可继续
   · 未登录也能正常练习（数据只留本机，界面会明确提示）

   依赖：WorkBuddy Cloud SDK（CDN 加载）
   若 CDN 不可达（如断网、桌面离线版），本模块静默降级为「仅本机」，不阻塞页面。
   ============================================================ */
(function (global) {
    "use strict";

    /* ---------- 公开配置（仅这两项可出现在前端代码里） ---------- */
    var CONFIG = {
        endpoint: "https://yinjue-xingxing-63887.app.workbuddy.host",
        publishableKey: "wbpk_4VKGsYVBUAN6SontWXNat4_93VTfyQrTgYxsVVkapWPrE3K3pQyhMtx"
    };

    var SDK_URL = "https://cdn.jsdelivr.net/npm/@tencent-ai/workbuddy-cloud-sdk@dev/lib/index.global.js";

    /* ---------- 需要同步到云端的本机键 ---------- */
    var SYNC_KEYS = [
        "yx-profile",           // 昵称 / 头像 / 学段
        "yx-done",              // 手动标记完成的关卡
        "rhythm-level-progress",// 节奏闯关进度
        "rhythm-training-records",
        "theory-records",
        "score-records",
        "legong-homework",
        "lg-modes"
    ];

    var SNAP_PREFIX = "yx-snap-";   // 本机按账号留档：yx-snap-<uid>
    var TABLE = "progress_kv";

    var cloud = null;
    var readyPromise = null;
    var user = null;
    var loadError = null;
    var listeners = [];
    var pending = {};
    var timer = null;
    var mirrorInstalled = false;

    /* ================= 工具 ================= */

    function safeParse(raw) {
        if (raw === null || raw === undefined) return null;
        try { return JSON.parse(raw); } catch (e) { return raw; }
    }

    function localGet(k) {
        try { return global.localStorage.getItem(k); } catch (e) { return null; }
    }
    function localSet(k, v) {
        try { global.localStorage.setItem(k, v); } catch (e) {}
    }
    function localDel(k) {
        try { global.localStorage.removeItem(k); } catch (e) {}
    }

    function uidOf(u) {
        if (!u) return null;
        return u.id || u.uid || u.userId || u.user_id || u.sub || null;
    }

    function emit() {
        listeners.forEach(function (cb) {
            try { cb(user); } catch (e) {}
        });
    }

    function loadScript(src, timeoutMs) {
        return new Promise(function (resolve, reject) {
            if (global.WorkBuddyCloud) { resolve(); return; }
            var done = false;
            var el = document.createElement("script");
            var t = setTimeout(function () {
                if (done) return;
                done = true;
                reject(new Error("SDK 加载超时"));
            }, timeoutMs || 9000);
            el.src = src;
            el.async = true;
            el.onload = function () {
                if (done) return; done = true; clearTimeout(t); resolve();
            };
            el.onerror = function () {
                if (done) return; done = true; clearTimeout(t);
                reject(new Error("SDK 加载失败"));
            };
            document.head.appendChild(el);
        });
    }

    /* ================= 初始化 ================= */

    function init() {
        if (readyPromise) return readyPromise;
        readyPromise = loadScript(SDK_URL, 9000)
            .then(function () {
                if (!global.WorkBuddyCloud || !global.WorkBuddyCloud.createWorkBuddyCloud) {
                    throw new Error("SDK 未就绪");
                }
                cloud = global.WorkBuddyCloud.createWorkBuddyCloud({
                    endpoint: CONFIG.endpoint,
                    publishableKey: CONFIG.publishableKey
                });
                installMirror();
                return cloud.auth.getSession();
            })
            .then(function (res) {
                var session = res && res.data;
                user = (session && session.user) || null;
                try {
                    cloud.auth.onAuthStateChange(function (event, s) {
                        user = (s && s.user) || null;
                        emit();
                    });
                } catch (e) {}
                emit();
                if (user) { return syncPull(); }
                return null;
            })
            .catch(function (err) {
                loadError = err && err.message ? err.message : "云端不可用";
                emit();
                return null;
            });
        return readyPromise;
    }

    function status() {
        return {
            ready: !!cloud,
            online: !!user,
            error: loadError,
            user: user,
            label: publicLabel()
        };
    }

    function publicLabel() {
        if (!user) return null;
        var meta = user.user_metadata || {};
        return meta.nickname || meta.display_name || (user.email ? String(user.email).split("@")[0] : "同学");
    }

    /* ================= 账号 ================= */

    function emailPwdLogin(email, password) {
        return ensure().then(function () {
            return cloud.auth.signInWithPassword({ email: email, password: password });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            var s = res && res.data;
            user = (s && s.user) || (s && s.session && s.user) || user;
            return refreshUser();
        });
    }

    function sendOtp(email) {
        return ensure().then(function () {
            return cloud.auth.sendOtp({ email: email });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            return res.data;
        });
    }

    /* 验证码登录（不发密码） */
    function otpStart(email) {
        return ensure().then(function () {
            return cloud.auth.signInWithOtp({ email: email });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            return res.data;   /* { verify } */
        });
    }

    function otpComplete(starter, code) {
        return ensure().then(function () {
            if (!starter || !starter.verify) throw new Error("请先获取邮箱验证码");
            return starter.verify({ token: code });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            return refreshUser();
        });
    }

    /* 注册：验证码 + 自设密码 */
    function verifySignup(email, code, password, isExistingUser, verificationId) {
        return ensure().then(function () {
            return cloud.auth.verifyOtp({
                verificationId: verificationId,
                token: code,
                email: email,
                isExistingUser: !!isExistingUser,
                password: isExistingUser ? undefined : password
            });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            return refreshUser();
        });
    }

    var resetStarter = null;

    /* 第一步：发送重置验证码到邮箱 */
    function resetPassword(email) {
        return ensure().then(function () {
            return cloud.auth.resetPasswordForEmail(email);
        }).then(function (res) {
            if (res && res.error) throw res.error;
            resetStarter = res && res.data;
            return resetStarter;
        });
    }

    /* 第二步：用邮箱收到的验证码设置新密码 */
    function finishReset(code, newPassword) {
        return ensure().then(function () {
            if (!resetStarter || !resetStarter.updateUser) {
                throw new Error("请先获取邮箱验证码");
            }
            return resetStarter.updateUser({ nonce: code, password: newPassword });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            resetStarter = null;
            return refreshUser();
        });
    }

    function signOut() {
        return ensure().then(function () {
            return syncPushAll();
        }).then(function () {
            stashLocalSnapshot();
            return cloud.auth.signOut();
        }).then(function () {
            clearLocalSyncedKeys();
            user = null;
            emit();
            return true;
        }).catch(function () {
            user = null;
            emit();
            return true;
        });
    }

    function refreshUser() {
        return cloud.auth.getUser().then(function (res) {
            var u = res && res.data;
            if (u && u.user) user = u.user;
            else if (u && (u.id || u.email)) user = u;
            var sessionP = cloud.auth.getSession().then(function (r) {
                var s = r && r.data;
                if (s && s.user) user = s.user;
            }).catch(function () {});
            return sessionP.then(function () {
                installMirror();
                return syncPull();
            });
        }).then(function () {
            emit();
            return user;
        });
    }

    function ensure() {
        return init().then(function () {
            if (!cloud) throw new Error(loadError || "云端不可用，请检查网络后重试");
            return cloud;
        });
    }

    /* ================= 进度同步 ================= */

    function collectLocal() {
        var out = {};
        SYNC_KEYS.forEach(function (k) {
            var raw = localGet(k);
            if (raw !== null) out[k] = safeParse(raw);
        });
        return out;
    }

    function applyLocal(kv) {
        SYNC_KEYS.forEach(function (k) {
            if (Object.prototype.hasOwnProperty.call(kv, k) && kv[k] !== null && kv[k] !== undefined) {
                localSet(k, JSON.stringify(kv[k]));
            } else {
                localDel(k);
            }
        });
    }

    /* 登录后：云端有数据 → 云端为准；云端为空 → 把本机进度上传（首次注册带走已有练习） */
    function syncPull() {
        if (!cloud || !user) return Promise.resolve(null);
        var uid = uidOf(user);
        return cloud.database.from(TABLE).select("key,value").then(function (res) {
            if (res && res.error) throw res.error;
            var rows = (res && res.data) || [];
            if (rows.length) {
                var kv = {};
                rows.forEach(function (r) { kv[r.key] = r.value; });
                applyLocal(kv);
                return { direction: "down", count: rows.length };
            }
            var local = collectLocal();
            if (Object.keys(local).length === 0 && uid) {
                var snap = localGet(SNAP_PREFIX + uid);
                if (snap) {
                    var back = safeParse(snap) || {};
                    applyLocal(back);
                    return syncPushAll();
                }
            }
            return syncPushAll();
        }).catch(function () {
            return null;
        });
    }

    function upsertKey(k, value) {
        var row = { key: k, value: value };
        return cloud.database.from(TABLE)
            .upsert(row, { onConflict: "owner_id,key" })
            .then(function (res) {
                if (!res || !res.error) return true;
                /* 回退：先改后增 */
                return cloud.database.from(TABLE).update({ value: value, updated_at: new Date().toISOString() })
                    .eq("key", k).select()
                    .then(function (u) {
                        if (u && Array.isArray(u.data) && u.data.length) return true;
                        return cloud.database.from(TABLE).insert(row).then(function (i) {
                            return !(i && i.error);
                        });
                    });
            }).catch(function () { return false; });
    }

    function syncPushAll() {
        if (!cloud || !user) return Promise.resolve(false);
        var kv = collectLocal();
        var keys = Object.keys(kv);
        if (!keys.length) return Promise.resolve(true);
        return Promise.all(keys.map(function (k) { return upsertKey(k, kv[k]); }))
            .then(function () { return true; });
    }

    /* 把本机数据留档（退出时用，方便下次登录立刻恢复） */
    function stashLocalSnapshot() {
        var uid = uidOf(user);
        if (!uid) return;
        try {
            localSet(SNAP_PREFIX + uid, JSON.stringify(collectLocal()));
        } catch (e) {}
    }

    function clearLocalSyncedKeys() {
        SYNC_KEYS.forEach(function (k) { localDel(k); });
    }

    /* 拦截 localStorage 写入，把练习数据自动同步到云端 */
    function installMirror() {
        if (mirrorInstalled || !global.localStorage) return;
        mirrorInstalled = true;
        var origSet = global.localStorage.setItem.bind(global.localStorage);
        var origRemove = global.localStorage.removeItem.bind(global.localStorage);

        global.localStorage.setItem = function (k, v) {
            origSet(k, v);
            if (SYNC_KEYS.indexOf(k) >= 0) schedule(k);
        };
        global.localStorage.removeItem = function (k) {
            origRemove(k);
            if (SYNC_KEYS.indexOf(k) >= 0) schedule(k);
        };
    }

    function schedule(k) {
        if (!user || !cloud) return;
        pending[k] = true;
        if (timer) clearTimeout(timer);
        timer = setTimeout(flush, 1500);
    }

    function flush() {
        timer = null;
        if (!user || !cloud) { pending = {}; return; }
        var keys = Object.keys(pending);
        pending = {};
        keys.forEach(function (k) { upsertKey(k, safeParse(localGet(k))); });
    }

    /* ================= 统计（星星 / 连续天数） ================= */

    function recordList(key) {
        var v = safeParse(localGet(key));
        return Array.isArray(v) ? v : [];
    }

    function dayKey(ts) {
        var d = new Date(ts);
        if (isNaN(d.getTime())) return null;
        var m = d.getMonth() + 1, dd = d.getDate();
        return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (dd < 10 ? "0" + dd : dd);
    }

    function stats() {
        var rhythm = recordList("rhythm-training-records");
        var theory = recordList("theory-records");
        var score = recordList("score-records");
        var levelState = safeParse(localGet("rhythm-level-progress")) || {};
        var done = safeParse(localGet("yx-done")) || {};

        /* 星星 */
        var stars = 0;
        var passes = levelState.passes || {};
        Object.keys(passes).forEach(function (k) {
            stars += Math.min(Number(passes[k]) || 0, 2);
        });
        theory.forEach(function (r) {
            var a = Number(r.accuracy) || 0;
            if (a <= 1) a = a * 100;
            if (a >= 80) stars += 1;
        });
        rhythm.forEach(function (r) {
            var a = Number(r.accuracy) || 0;
            if (a <= 1) a = a * 100;
            if (a >= 85) stars += 1;
        });
        score.forEach(function (r) {
            if ((Number(r.score) || 0) >= 80) stars += 1;
        });
        stars += Object.keys(done).filter(function (k) { return done[k]; }).length;

        /* 活跃日 */
        var days = {};
        rhythm.forEach(function (r) { var d = dayKey(Number(r.timestamp)); if (d) days[d] = 1; });
        theory.forEach(function (r) { var d = dayKey(new Date(r.at || 0).getTime()); if (d) days[d] = 1; });
        score.forEach(function (r) { var d = dayKey(new Date(String(r.time || "").replace(/\//g, "-")).getTime()); if (d) days[d] = 1; });
        Object.keys(done).forEach(function (k) { if (done[k] && done[k].at) { var d = dayKey(new Date(done[k].at).getTime()); if (d) days[d] = 1; } });

        var list = Object.keys(days).sort();
        var streak = 0;
        if (list.length) {
            var today = new Date(); today.setHours(0, 0, 0, 0);
            var cursor = new Date(today.getTime());
            if (!days[dayKey(cursor.getTime())]) cursor.setDate(cursor.getDate() - 1);
            while (days[dayKey(cursor.getTime())]) {
                streak += 1;
                cursor.setDate(cursor.getDate() - 1);
            }
        }

        return {
            stars: stars,
            streak: streak,
            activeDays: list.length,
            runs: rhythm.length + theory.length + score.length,
            rhythmRuns: rhythm.length,
            theoryRuns: theory.length,
            scoreRuns: score.length,
            lastActive: list.length ? list[list.length - 1] : null
        };
    }

    /* ================= 档案 ================= */

    function profile() {
        var p = safeParse(localGet("yx-profile")) || {};
        return {
            nickname: p.nickname || publicLabel() || "同学",
            avatar: p.avatar || "🐣",
            grade: p.grade || ""
        };
    }

    function saveProfile(patch) {
        var next = Object.assign(profile(), patch || {});
        localSet("yx-profile", JSON.stringify(next));
        return next;
    }

    /* ================= 对外接口 ================= */

    global.YX = {
        init: init,
        status: status,
        onChange: function (cb) { if (typeof cb === "function") listeners.push(cb); },
        currentUser: function () { return user; },
        displayName: publicLabel,

        signInWithPassword: emailPwdLogin,
        sendOtp: sendOtp,
        otpStart: otpStart,
        otpComplete: otpComplete,
        verifySignup: verifySignup,
        resetPassword: resetPassword,
        finishReset: finishReset,
        signOut: signOut,

        syncNow: syncPushAll,
        stats: stats,
        profile: profile,
        saveProfile: saveProfile,

        SYNC_KEYS: SYNC_KEYS
    };
})(window);
