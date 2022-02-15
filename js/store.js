var g_store = {
    list: {},
    tables: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
    prefix: 'test_',
    getName: function(name) {
        return this.prefix + name;
    },
    convert: async function() {
        for (var n of this.tables) {
            var prefix = 'picManager_database_';
            var d = localStorage.getItem(prefix + n);
            console.log(d);
            if (d != null) {
                var data = JSON.parse(d);
                console.log(n);
                if (data) {
                    var store = this.getStore(n);
                    for (var k in data) {
                        await store.setItem(k, data[k]);
                    }
                    localStorage.removeItem(prefix+n);
                }
            }
        }
    },
    resetAll: async function() {
        for (var n of this.tables) {
            this.clear(n);
        }
    },
    removeAll: async function() {
        for (var n of this.tables) {
            this.drop(n);
        }
    },
    preload: async function() {
        // for (var n of this.tables) {
        //    await this.init(n);
        // }
        this.convert();
    },
    getStore: function(name) {
        name = g_store.getName(name);
        if (!this.list[name]) {
            this.list[name] = localforage.createInstance({
                name: name,
                storeName: 'list',
            });
        }
        return this.list[name];
    },
    drop: async function(name) {
        return await this.getStore(name).dropInstance();
    },
    get: async function(name, k) {
        return await this.getStore(name).getItem(k);
    },
    remove: async function(name, k) {
        return await this.getStore(name).removeItem(k);
    },
    set: async function(name, k, v) {
        return await this.getStore(name).setItem(k, v);
    },
    forEach: async function(name, callback) {
        return await this.getStore(name).iterate(callback);
    },
    clear: async function(name) {
        return await this.getStore(name).clear();
    },
    length: async function(name) {
        return await this.getStore(name).length();
    },
    keys: async function(name) {
        return await this.getStore(name).keys();
    },
}
g_store.preload();