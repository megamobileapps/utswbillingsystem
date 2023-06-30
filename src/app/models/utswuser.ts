interface subSubscription {
    gradeid:string;
    subid:string;
    validtill:string;
    name:string;
};

interface paymentdetails {
    txndate:string;
    amount:string;
};
export interface User {
    id: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email:string;
    phone:string;
    country?:string;
    authdata?: string;
    preferredClasses?:Array<string>;
    subscriptions?:{
        printed?:Array<subSubscription>,
        download?:Array<subSubscription>,
        online?:Array<subSubscription>,
        downloadwb?:Array<subSubscription>
        downloadws?:Array<subSubscription>
        downloadhp?:Array<subSubscription>
    },
    payments?:Array<paymentdetails>;
}