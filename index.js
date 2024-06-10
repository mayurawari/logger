import fs from "fs";
import winston from "winston";
import mongodb from "mongodb";
import { MongoClient } from "mongodb";
import cron from "node-cron";
import {config} from "dotenv";
config();

const uri=process.env.URI || null;
const client=new MongoClient(uri);


const logger=winston.createLogger({
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({filename:"loggerdata.log"}),


    ]
});


async function connecttodb(){
    try {
        await client.connect();
        logger.info("connected to database");
        await readdata();
    } catch (error) {
        console.log(error);
    }
}

async function readdata(){
    try {
        const data=JSON.parse(fs.readFileSync('data.json','utf8'));
        await uploaddata(data);
    } catch (error) {
        console.log(error);
    }
}


async function uploaddata(data){
    const databse=client.db("clientdata");
    const collection=databse.collection("users");

    for(const entry of data){
        const existingentry=await collection.findOne({id:entry.id});
        if(!existingentry){
            try {
                await collection.insertOne(entry);
                logger.info(`new entry added : ${JSON.stringify(entry)}`);

            } catch (error) {
                logger.error("error");
            }
        }
    }
}


// cron.schedule('0 0 ')
cron.schedule('0 0 */12 * *', () => {
    readdata();
    console.log('running 2 times a day');
  });


  async function startserver(){
    await connecttodb();
  }
  startserver();