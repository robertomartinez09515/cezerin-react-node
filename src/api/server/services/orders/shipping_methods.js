'use strict';

var mongo = require('../../lib/mongo');
var utils = require('../../lib/utils');
var parse = require('../../lib/parse');
var ObjectID = require('mongodb').ObjectID;

class ShippingMethodsService {
  constructor() {}

  getMethods(params = {}) {
    let filter = {};
    const id = parse.getObjectIDIfValid(params.id);
    if (id) {
      filter._id = new ObjectID(id);
    }

    return mongo.db.collection('shippingMethods').find(filter).toArray().then(items => items.map(item => this.renameDocumentFields(item)))
  }

  getSingleMethod(id) {
    if (!ObjectID.isValid(id)) {
      return Promise.reject('Invalid identifier');
    }
    return this.getMethods({id: id}).then(methods => {
      return methods.length > 0
        ? methods[0]
        : null;
    })
  }

  addMethod(data) {
    const method = this.getDocumentForInsert(data);
    return mongo.db.collection('shippingMethods').insertMany([method]).then(res => this.getSingleMethod(res.ops[0]._id.toString()));
  }

  updateMethod(id, data) {
    if (!ObjectID.isValid(id)) {
      return Promise.reject('Invalid identifier');
    }
    const methodObjectID = new ObjectID(id);
    const method = this.getDocumentForUpdate(id, data);

    return mongo.db.collection('shippingMethods').updateOne({
      _id: methodObjectID
    }, {$set: method}).then(res => this.getSingleMethod(id));
  }

  deleteMethod(id) {
    if (!ObjectID.isValid(id)) {
      return Promise.reject('Invalid identifier');
    }
    const methodObjectID = new ObjectID(id);
    return mongo.db.collection('shippingMethods').deleteOne({'_id': methodObjectID});
  }

  getDocumentForInsert(data) {
    let method = {
      'conditions': {
        // 'countries': [],
        // 'states': [],
        // 'cities': [],
        // 'sub_total_min': null
        // 'sub_total_max': null
        // 'weight_min': null
        // 'weight_max': null
      }
      // 'logo': '',
      // 'app_id': null,
      // 'app_settings': {},
    }

    method.name = parse.getString(data.name);
    method.description = parse.getString(data.description);
    method.position = parse.getNumberIfPositive(data.position) || 0;
    method.enabled = parse.getBooleanIfValid(data.enabled, true);
    method.price = parse.getNumberIfPositive(data.price) || 0;

    return method;
  }

  getDocumentForUpdate(id, data) {
    if (Object.keys(data).length === 0) {
      return new Error('Required fields are missing');
    }

    let method = {}

    if (data.name !== undefined) {
      method.name = parse.getString(data.name);
    }

    if (data.description !== undefined) {
      method.description = parse.getString(data.description);
    }

    if (data.position !== undefined) {
      method.position = parse.getNumberIfPositive(data.position) || 0;
    }

    if (data.enabled !== undefined) {
      method.enabled = parse.getBooleanIfValid(data.enabled, true);
    }

    if (data.price !== undefined) {
      method.price = parse.getNumberIfPositive(data.price) || 0;
    }

    return method;
  }

  renameDocumentFields(item) {
    if (item) {
      item.id = item._id.toString();
      delete item._id;
    }

    return item;
  }

  getErrorMessage(err) {
    return {'error': true, 'message': err.toString()};
  }
}

module.exports = new ShippingMethodsService();
