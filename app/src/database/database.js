var mysql = require('mysql');
var thr = require('throw');
var q = require('q');
// Creates MySql database connection
var pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "igreja"
});

var tables = {
  "teste": {
    "name":"teste",
    "associated": [],
    "allias": "Teste",

  },
  "person": {
    "name":"persons",
    "associated": [
      {
        "table":"memberships",
        "key": "_id",
        "referes_to": "person_id"
      }
    ],
    "allias": "Person",
    //"columns":["_id", "name", "birthday", "rg", "cpf", "gender"]
  },
  "membership": {
      "name":"memberships",
      "associated": [
        {
          "table":"persons",
          "key": "person_id",
          "referes_to": "person_id"
        },
        {
          "table":"receive_types",
          "key": "receive_type_id",
          "referes_to": "_id"
        }/*,
        {
          "table":"marriages",
          "key": "_id",
          "referes_to": "_id"
        },*/
      ],
      "allias": "Membership",
      "columns":["_id", "person_id", "receive_type_id", "receive_date"]
  }
}

function find(options){
  var deferred = q.defer();
  //type, entity, fields = "*", conditions=false, recursive = 0,  order = false, limit = false
  //type can be 'count', 'first', 'all'
  var type = options.type ? options.type : 'all';
  var table = options.table || thr("required option entity");
  var fields = options.fields ? options.fields : '*';
  var conditions = options.conditions ? options.conditions : false;
  var recursive = options.recursive ? options.recursive : false;
  var order = options.order ? options.order : false;
  var limit = options.order ? options.limit : false;
  //fields type resolve
  var returnFields = '#';
  if(type == 'count'){
    returnFields = 'count(#)'
  }
  if(Object.prototype.toString.call( fields ) === '[object Array]'){
    fieldsStr = "";
    for (i = 0; i < fields.length; i++) {
      fieldsStr += fields[i] + ",";
    }
    fieldsStr = fieldsStr.substring(0,fieldsStr.length-1);
    returnFields = returnFields.replace("#", fieldsStr);
  }else{
    returnFields = returnFields.replace("#", fields);
  }

  //conditions resolve
  var returnWhere = "";
  if(conditions){
    returnWhere = "WHERE";
    if(Object.prototype.toString.call( conditions ) === '[object Array]'){
      for (i = 0; i < conditions.length; i++) {
        if(i==0){
          returnWhere += " " + conditions[i].expression;
        } else {
          returnWhere += " " + conditions[i].operator+" "+conditions[i].expression;
        }
      }
    }else{
      returnWhere += " " + conditions.expression;
    }
  }
  var sql = "SELECT "+returnFields+" FROM " + table + returnWhere;

  connection.query(sql, function (err, rows) {
    if (err) deferred.reject(err);
    deferred.resolve(rows);
  });

  return deferred.promise;
}

module.exports.pool = pool;
module.exports.find = find;
module.exports.table = tables;
