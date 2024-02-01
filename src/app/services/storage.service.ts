import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private storage = inject(Storage);
    private _storage!: Storage;

    constructor() {
        this.init();
    }

    async init() {
        this._storage = await this.storage.create();
    }

    public set(key: string, value: any) {
        return this._storage.set(key, value);
    }

    public get(key: string) {
        return this._storage.get(key);
    }

    public remove(key: string) {
        return this._storage.remove(key);
    }
}
