// Model
var Item = Backbone.Model.extend({});


// Collection
var ItemCollection = Backbone.Collection.extend({
  model: Item,
  
  //comparator: 'name',
  
  // Price Comparator (lowest to highest price)
  comparator: function(a,b) {
    return b.get('price') - a.get('price');
  },
  
  localStorage: new Backbone.LocalStorage('ItemCart'),
  
  // Get all the names in the collection
  getNames: function() {
    this.each(function(item) {
      //return item;
      console.log(item.get('name'));
    });
  },

  // Get the total price using Underscore's reduce function
  getTotal: function() {
    return this.reduce( function(memo, item) {
      return memo + item.get('price');
    }, 0);
  }
});


// View
var AddItemView = Backbone.View.extend({
  el: '#item-form',
  
  events: {
    'click #add-item': 'addItem'
  },
  
  addItem: function(e) {
    e.preventDefault();
    
    var newItem = {};
    var price = this.$('#item-price').val();

    // Capitalize text
    newItem.name = this.$('#item-input').val();
    // Convert price to number
    newItem.price = parseFloat(price);

    // Store inputs in object
    var item = new Item({
      name: newItem.name,
      price: newItem.price
    });
    
    // Add to collection
    this.collection.create(item);
    
    // Clear form
    this.el.reset();
    
    // Focus back on first element
    this.$('#item-input').focus();
  }
});


// View
var ItemCollectionView = Backbone.View.extend({
  el: '#table-body',
  
  template: _.template($('#itemCollection-template').html()),
  
  initialize: function() {
    this.listenTo(this.collection, 'add', this.renderItem);
  },
  
  render: function() {
    this.collection.each(function(item) {
      this.renderItem(item);
    }, this);
    
    this.collection.fetch();
    
    return this;
  },
  
  renderItem: function(item) {
    var itemView = new ItemView({ model: item });
    this.$el.append(itemView.render().el);
  }
});


// View
var ItemView = Backbone.View.extend({
  tagName: 'tr',
  
  template: _.template($('#item-template').html()),
  
  bindings: {
    "#name": { 
      observe: 'name',
      onGet: 'formatName'
    },
    '#price': { 
      observe: 'price', 
      onGet: 'formatPrice'
    }
  },
  
  events: {
    'click #delete': 'deleteItem'
  },
  
  render: function() {
    this.$el.html(this.template({}));
    this.stickit();
    return this;
  },
  
  formatPrice: function (price) {
    return '$ ' + price.toFixed(2);
  },
  
  formatName: function (name) {
    return name.substring(0,1).toUpperCase() + name.substring(1, name.length);
  },
  
  deleteItem: function() {
    console.log('Removing Item: ' + this.model.get('name'));
    this.model.destroy(); // delete model
    this.remove(); // delete view
  }
});


// Should the TotalView be referencing a TotalModel?
// How should TotalModel get the total sum?
var TotalView = Backbone.View.extend({
  el: '#total-view',
  
  initialize: function() {
    this.listenTo(this.collection, 'add remove', this.render);
  },
  
  template: _.template($('#total-template').html()),
  
  render: function() {
    var total = this.showTotal();
    
    this.$el.html(this.template({}));
    this.$el.find('#total-price').html(total);
    return this;
  },
  
  showTotal: function() {
    return '$ ' + this.collection.getTotal().toFixed(2);
  }
});

var itemCollection = new ItemCollection([
  {
    name: 'Paprika',
    price: 5.99
  },
  {
    name: 'Turmeric', 
    price: 3.99
  },
  {
    name: 'Cayenne',
    price: 1.95
  },
  {
    name: 'Iditarod',
    price: 9.99
  }
]);

// Instantiate Views
// Reference the collection you're trying to construct... doh.
var itemsView = new ItemCollectionView({ collection: itemCollection });
var addPersonView = new AddItemView({ collection: itemCollection });
var totalView = new TotalView({ collection: itemCollection });

$('#main').append(itemsView.render().el);
console.log(itemsView);
$('#total-view').append(totalView.render().el);