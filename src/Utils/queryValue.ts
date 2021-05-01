function queryValueStrFun (query: any)  {
    const setValues : string[] = []
    if(!query){
        return;
    }
    query?.forEach((_query: string) => {
        setValues.push("'" +_query + "'")
    });
    return "(" + setValues.join(',') + ")"
}

export default queryValueStrFun;