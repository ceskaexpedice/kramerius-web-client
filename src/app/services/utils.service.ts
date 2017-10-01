import { Injectable } from '@angular/core';


@Injectable()
export class Utils {

    escapeUuid(uuid: string): string {
        return uuid.replace(':', '\\:');
    }

}
