const ISTDate = ()=>{
    const utcDate = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    return  new Date(utcDate.getTime() + offset);
}

module.exports = ISTDate