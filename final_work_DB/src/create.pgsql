----------------------------------------------------------CREATE--------------------------------------------------------------------------
CREATE DATABASE starLinks

CREATE SCHEMA star

CREATE TABLE star.users(
    "id" serial,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    PRIMARY key (id)
);

CREATE TABLE star.files(
    id serial,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "link" VARCHAR(600) NOT NULL,
    "language" VARCHAR(255) NOT NULL,
    "date" VARCHAR(255) NOT NULL,
    "categories" INTEGER NOT NULL,
    "subcategories" integer,
    "user" INTEGER NOT NULL,
    PRIMARY key(id)
);

CREATE TABLE star.categories(
    "id" serial,
    "name" VARCHAR(255) NOT NULL,
    PRIMARY key(id)
);


CREATE TABLE star.favorites(
    "id" serial,
    "user" INTEGER NOT NULL,
    "file" INTEGER NOT NULL,
    PRIMARY key(id)
);


CREATE TABLE star.subCategories(
    "id" serial,
    "name" VARCHAR(255) NOT NULL,
    "categories" INTEGER NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE star.files ADD CONSTRAINT "files_subcategories_foreign" FOREIGN KEY("subcategories") REFERENCES star.subcategories("id");
ALTER TABLE star.files ADD CONSTRAINT "files_categories_foreign" FOREIGN KEY("categories") REFERENCES star.categories("id");
ALTER TABLE star.files ADD CONSTRAINT "files_user_foreign" FOREIGN KEY("user") REFERENCES star.users("id");
ALTER TABLE star.subCategories ADD CONSTRAINT "subcategories_categories_foreign" FOREIGN KEY("categories") REFERENCES star.categories("id");
ALTER TABLE star.favorites ADD CONSTRAINT "favorites_user_foreign" FOREIGN KEY("user") REFERENCES star.users("id");
ALTER TABLE star.favorites ADD CONSTRAINT "favorites_file_foreign" FOREIGN KEY("file") REFERENCES star.files("id")

--------------------------------------------Access---------------------------------------------

CREATE ROLE standardUser;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA star TO standardUser;
grant all on schema star to standardUser;
GRANT EXECUTE ON FUNCTION star.createuser(text,text,text) to standardUser;
GRANT INSERT ON star.users to standardUser;
GRANT SELECT ON star.users to standardUser;
GRANT SELECT ON star.allfiles to standardUser;
GRANT SELECT ON star.categories,star.subcategories to standardUser;
GRANT INSERT,SELECT ON star.favorites to standardUser;
GRANT SELECT,INSERT,DELETE,UPDATE ON star.files to standardUser;
GRANT DELETE ON star.favorites to standardUser;
GRANT EXECUTE ON FUNCTION star.deleteFile(integer) to standardUser;

create user user_1 LOGIN PASSWORD '123' IN ROLE standardUser;

CREATE ROLE master;

grant all on schema star to master;
GRANT ALL ON star.allfiles,star.users,star.categories,star.subcategories,star.favorites,star.allusers to master;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA star TO master;

create user master_1 LOGIN PASSWORD '123' IN ROLE master;

-----------------------------------------Storage PROCEDURE-------------------------------------

CREATE OR REPLACE FUNCTION star.addFile(_user integer,_fileName text,_description text,_link text,_language text,_date text,
_categorie text,_subCategorie text)

    RETURNS void AS $$
    BEGIN 
        IF NOT EXISTS (select * from star.categories where "name"=_categorie) then
            insert into star.categories ("name") values (_categorie);
            
        END IF;

        IF NOT EXISTS (select * from star.subCategories where "name"=_subCategorie) then
            insert into star.subCategories ("name","categories") values (_subCategorie,(select id from star.categories WHERE "name"=_categorie));
        END IF;
        insert into star.files ("name","description","link","language","date","categories","subcategories","user") values 
            (_fileName, _description, _link, _language, _date,(select id from star.categories where "name"=_categorie),(select id from star.subcategories where "name"=_subcategorie),_user);
    END;
    $$ language 'plpgsql'


CREATE OR REPLACE FUNCTION star.createUser(_name text,_email text,_password text)

    RETURNS TEXT AS $$
    BEGIN
        IF NOT EXISTS (select "id" from star.users where "email"=_email) THEN
            INSERT INTO star.users ("name","email","password") VALUES (_name,_email,_password);
        ELSE
            RETURN 'Email já cadastrado!';
        END IF;
        RETURN 'Cadastrado!';
    END;
    $$ LANGUAGE 'plpgsql'


CREATE OR REPLACE FUNCTION star.login(_email text,_password text)
    RETURNS TEXT AS $$

    BEGIN
        IF EXISTS (select * from star.users where email=_email) THEN
            IF ((select "password" from star.users where email=_email)=_password) THEN
                RETURN concat((select "id" from star.users where email=_email),'&',(select "name" from star.users where email=_email));
            ELSE
                RETURN 'Senha incorreta!';
            END IF;
        ELSE
        RETURN 'Email não cadastrado!';
        END IF;
        
    END;
    $$ LANGUAGE 'plpgsql'


CREATE OR REPLACE FUNCTION star.deleteFile(_id integer)
    RETURNS TEXT AS $$
    DECLARE 
    BEGIN
        IF EXISTS (SELECT * FROM star.favorites WHERE "file"=_id) THEN
            DELETE FROM star.favorites where "file"=_id;
        END IF;
        DELETE FROM star.files WHERE "id"=_id;
        
        RETURN 'Deletado!';
    END;
    $$ LANGUAGE 'plpgsql';

------------------------------------------VIEWS--------------------------------------------------

create view star.allFiles as (select * from star.files );
create view star.allUsers as (select "name","email" from star.users);

------------------------------------------TRIGGERS-----------------------------------------------

CREATE OR REPLACE FUNCTION checkDeleteCategories()
RETURNS TRIGGER AS $$
DECLARE 
i integer := 0;
n integer := (SELECT id FROM star.categories order by id limit 1);
BEGIN
        LOOP
            EXIT WHEN i=n;
            i := i + 1;

            IF NOT EXISTS (SELECT id from star.files where categories=(SELECT id from star.categories where id=i)) then
                IF EXISTS (select * from star.subcategories where "categories" = i) THEN
                    delete from star.subcategories where "categories" = i;
                END IF;
                IF EXISTS (select * from star.categories where "id" = i ) THEN
                    delete from star.categories where "id" = i;
                END IF;
            END IF;
        END LOOP;
        RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkDeleteCategories
    AFTER DELETE ON star.files
        EXECUTE PROCEDURE checkDeleteCategories();

CREATE OR REPLACE FUNCTION star.deleteCategorie(_id integer)
    RETURNS void AS $$
    BEGIN
        delete from star.subcategories where "categories"=_id;
        delete from star.categories where "id"=_id;
    END;
$$ LANGUAGE 'plpgsql'

