const axios = require('axios');
const API_BASE_URL = process.env.API_BASE_URL;

export default async function handler(req, res) {
  try{
    let content_type_uid = req.query.content_type_uid;
    let entry_uid = req.query.entry_uid;
    let urlcontent = "cdn.contentstack.io";
    
    //res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      var config = {
        method: 'GET',
        url: `https://${urlcontent}/v3/content_types/${content_type_uid}/entries/${entry_uid}`,
        headers: { 
          'Access-control-Allow-Origin': '*', 
          'Content-Type': 'application/json',
          'api_key': process.env.NEXT_PUBLIC_CONTENT_KEY,
          'access_token': process.env.NEXT_PUBLIC_ACCESS_TOKEN,
        }
      };

      axios(config).then(async function (response) {
        let responseData = response.data;
        res.status(200).json(responseData);
      }).catch(function (error) {
        res.status(500).json({message: error.message});
      });
     
  }catch{
    res.status(500).json({});
  }  
}