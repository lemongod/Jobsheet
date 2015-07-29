Jobs = new Mongo.Collection("jobs");

if (Meteor.isServer){
  Meteor.publish("jobs", function(){
    return Jobs.find({
      $or: [
        {private: {$ne:true}},
        { owner: this.userId}
      ]
    });
  });
}

if (Meteor.isClient){
  Meteor.subscribe("jobs");

  Template.body.helpers({
    jobs: function(){
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Jobs.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }
      else{
        return Jobs.find({}, {sort:{createdAt: -1}})
      }
    },
    hideCompleted: function(){
      return Session.get("hideCompleted");
    },
    incompleteCount: function(){
      return Jobs.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-job": function(event){
      event.preventDefault(); //prevents default browser form submissions

      var text = event.target.text.value;

      Meteor.call("addJob", text);

      event.target.text.value = "";
    },

    "change .hide-completed input": function(event){
      Session.set("hideCompleted", event.target.checked)
    }
  });

  Template.job.helpers({
    isOwner: function(){
      return this.owner === Meteor.userId();
    }
  });

  Template.job.events({
    "click .toggle-checked": function(){
      Meteor.call("setChecked", this._id, !this.checked); //set checked to opposite of its current value
    },
    "click .delete": function(){
      Meteor.call("deleteJob", this._id)
    },
    "click .toggle-private": function(){
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

Meteor.methods({
  addJob: function(text){
    //make sure user logged in
    if (!Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }

    Jobs.insert({
      text:text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteJob: function(taskId){
    var j = Jobs.findOne(taskId);
    if (j.private && j.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    else if(j.owner === Meteor.userId()){
       Jobs.remove(taskId);
    }
  },
  setChecked: function(taskId, setChecked){
    var j = Jobs.findOne(taskId);
    if (j.private && j.owner !== Meteor.userId() )
    {
      throw new Meteor.Error("not-authorized");
    }
    Jobs.update(taskId, {$set: {checked: setChecked}});
  },
  setPrivate: function(taskId, setToPrivate){
    var j = Jobs.findOne(taskId);
    if (j.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }
    Jobs.update(taskId, {$set:{private:setToPrivate}});
  }

});
