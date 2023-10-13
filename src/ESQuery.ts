export class ESQuery {
    readonly index:string;
    readonly type:string;
    readonly body:object;
    constructor(
        public time:number,
        public log:string
    ) {
        const logObj = JSON.parse(log.split('ES: ')[1]);
        this.index = logObj.index;
        this.type = logObj.type;
        this.body = logObj.body;
    }
}

  
  