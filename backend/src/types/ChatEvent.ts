import { Schema, type } from "@colyseus/schema";

export class ChatEvent extends Schema {

    @type('string')
    content: string;

    @type('string')
    username: string

    @type('string')
    time: string;

    constructor(content: string, username : string) {
        super();
        this.content = content;
        this.username = username;
        this.time = this.getCurrentTimeFormatted();
    }

    private getCurrentTimeFormatted(): string {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
        return `${hours}:${minutesStr}${ampm}`;
    }
}
