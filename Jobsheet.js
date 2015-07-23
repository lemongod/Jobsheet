if (Meteor.isClient){
  Template.body.helpers({
    tasks:[
      {text: "Hi"},
      {text: "Sup"},
      {text: "Howdy"}
    ]
  });
}
