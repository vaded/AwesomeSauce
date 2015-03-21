# nestCollection function makes it easy to nest collections in Backbone.js

Models often need nested collections. Given the example in the FAQ:

```javascript
var Mailbox = Backbone.Model.extend({
  initialize: function() {
    this.messages = new Messages;
  }
});

var myBox = new Mailbox;

```

Let's say you're using a NoSQL DB like mongodb, and are pulling down all the data for a given mailbox on page load. So your model's toJSON() output looks like this:

```javascript
{
mailboxName: "432 West",
messages: [
  {from: "Mom", title: "Learn your JavaScript"},
  {from: "City Hall", title: "Your dogs bark too loud"}
]
}
```

Now in your app you change or add a message:

```javascript
var momsMessage = myBox.messages.at(1);
momsMessage.set({title: "return to sender"});
```

Well now we have a *big* problem. `myBox.toJSON()` contains the *original* data, not the updated data. Your `'return to sender'` title won't get saved to the server unless you *override* Mailbox's toJSON function. What a pain, bloating all our models with overridden toJSON functions and change events. 

Backbone should be much smarter about nesting collections. The model's underlying data should point to the same data as the nested collection. This is easy with JS thanks to reference types (objects, arrays, etc.)
I created a simple static function called nestCollection. You pass it the `model`, the `attribute name`, and `collection instance`. It returns the `collection instance` for convenience. Example usage:

```javascript
var Mailbox = Backbone.Model.extend({
  initialize: function() {
    this.messages = nestCollection(this, 'messages', new Messages(this.get('messages')));
  }
});

var myBox = new Mailbox;

```

Now when you render `myBox` in a template or `save()` it to the server, it will always have the right data, all without overriding toJSON or any other trickery. 

The only real complaint I've heard about backbone is that it's complex and difficult to nest collections. Problem solved. 

## Before

When you create a nested model like so `this.messages = new Message(this.get('messages'))` you create a new object that is separate from your model's underlying data. It now looks like this:
![Before](http://dl.dropbox.com/u/3098507/before.png)

Hence the problem: you update your nested collection, and your model's data is out of date because they are different objects. 

## After

`nestCollection()` changes the model's attribute data to point to the nested collection's data:

![after](http://dl.dropbox.com/u/3098507/after.png)

Also whenever the nested collection adds/removes an item, that same item data gets added back to the model data. It's simple and elegantly solves the nesting problem. 
