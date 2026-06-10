export interface parentsList {
    isSuccess: boolean;
    data:Rows;
    
}


export interface Rows {
    rows: parentsData[];
    paginationInfo: any
}

export interface parentsData {
    id: number;
    code:string;
    name:string;
    group:number
}

export interface AccountsList {
    id: number;
    name: string;
    nameEn: string;
    nameAr: string;
    code: string;
    parentId: number;
    parentName: string;
    parentNameEn: string;
    parentNameAr: string;
    parentCode: string;
    parentParentId: number;
}



