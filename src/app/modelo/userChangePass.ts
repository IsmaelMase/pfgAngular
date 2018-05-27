export class UserChangePass {
    constructor(
        public email: string,
        public passEncr: string,
        public pass: string,
    ) { }
}