const connection = require('../connection');

module.exports = {
    async create(request,response){
        const {name,email,password} = request.body;
        //console.log("ROTA");
        const ans = await connection.select(connection.raw(`star.createuser('${name}','${email}','${password}')`));
    //console.log(ans[0].createuser);
    return response.json({ans:ans[0].createuser});
    },
    async login(request,response){
        const {email,password} = request.body;
        const ans = await connection.select(connection.raw(`star.login('${email}','${password}')`));
        const str = String(ans[0].login).split('&');
        if(str.length>1){
            return response.json({id:str[0],name:str[1]})
        }else{
            return response.json({error:str[0]})
        }
    },
    async allUsers(requeast,response){
        const ans = await connection.select('*').from('star.allusers');
        return response.json(ans);
    }
}

