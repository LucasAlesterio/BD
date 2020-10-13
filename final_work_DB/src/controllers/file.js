const connection = require('../connection');

module.exports = {
    async list(request,response){
        const all = await connection.select('*').from('star.allfiles');
        if(all){
            var i = 0;
            for(i=0;i<all.length;i++){
                all[i].categories = (await connection.select('name').from('star.categories').where('id',parseInt(all[i].categories)))[0].name;
                all[i].user = (await connection.select('name').from('star.users').where('id',parseInt(all[i].user)))[0].name;
                all[i].subcategories = (await connection.select('name').from('star.subcategories').where('id',parseInt(all[i].subcategories)))[0].name;
            };
        }
        return response.json(all)
    },

    async addFavorites(request,response){
        const {user,file} = request.body;
        await connection.insert({user:user,file:file}).into('star.favorites');
        return response.status(200).send('cadastrado');
    },

    async listFavorites(request,response){
        const {user} = request.body;
        const fav = await connection.select('file').from('star.favorites').where('user',parseInt(user));
        var a = [];
        var i = 0; 
        for(i=0;i<fav.length;i++){
            a.push(parseInt(fav[i].file));
        }
        //console.log(a);
        const all = await connection.select('*').from('star.files').whereIn('id',a);
        if(all){
            for(i=0;i<all.length;i++){
                all[i].categories = (await connection.select('name').from('star.categories').where('id',parseInt(all[i].categories)))[0].name;
                all[i].user = (await connection.select('name').from('star.users').where('id',parseInt(all[i].user)))[0].name;
                all[i].subcategories = (await connection.select('name').from('star.subcategories').where('id',parseInt(all[i].subcategories)))[0].name;
            };
        }
        return response.json(all);
    },

    async addFile(request,response){
        const {user,name,description,link,language,date,categories,subcategories} = request.body;
        await connection.select(connection.raw(`star.addfile('${user}','${name}','${description}','${link}','${language}','${date}','${categories}','${subcategories}')`));
        return response.status(200).send('Cadastrado');
    },

    async deleteFile(request,response){
        const {id} = request.body;
        await connection.select(connection.raw(`star.deletefile(${id})`));
        return response.status(200).send('Excluido');
    },

    async removeFavorites(request,response){
        const {file,user} = request.body;
        await connection('star.favorites').where('file',file).andWhere('user',user).del();
        return response.status(200).send("Removido!");
    },

    async listCategories(request,response){
        const ans = await connection.select('name').from('star.categories');
        return response.json(ans);
    },

    async listSubategories(request,response){
        const ans = await connection.select('name','categories').from('star.subcategories');
        return response.json(ans);
    },
    async updateFile(request,response){
        const {id,name,description,link,language,date,categories,subcategories} = request.body;
        if(name){
            await connection('star.files').where('id',id).update({name:name});
        };
        if(description){
            await connection('star.files').where('id',id).update({description:description});
        };
        if(link){
            await connection('star.files').where('id',id).update({link:link});
        };
        if(language){
            await connection('star.files').where('id',id).update({language:language});
        };
        if(date){
            await connection('star.files').where('id',id).update({date:date});
        };
        if(categories){
            await connection('star.files').where('id',id).update({categories:categories});
        };
        if(subcategories){
            await connection('star.files').where('id',id).update({subcategories:subcategories});
        }
        return response.status(200).send('Alterado!');
    }

}
