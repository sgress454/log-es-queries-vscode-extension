export class ESQuery {
    readonly log:string;
    readonly index:string;
    readonly type:string;
    readonly body:object;
    constructor(
        public time:number,
        log:string
    ) {
        this.log = log.split('ES: ')[1];
        const logObj = JSON.parse(this.log);
        this.index = logObj.index;
        this.type = logObj.type;
        this.body = logObj.body;
    }
}

  
  