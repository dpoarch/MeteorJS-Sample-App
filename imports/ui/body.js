import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
 
import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('tasks');
}); 

Template.body.onRendered(function () {
  var template = this;

  this.autorun(function () {
    if (template.subscriptionsReady()) {
      Tracker.afterFlush(function () {
        $('html, body').animate({ scrollTop: $(document).height() + 9000000 }, "slow");
        if(Meteor.user() == null){
          Accounts._loginButtonsSession.set('dropdownVisible', true);
        }
      });
    }
  });
});

Template.body.helpers({
  tasks() {
    const instance = Template.instance();
    if (instance.state.get('hideCompleted')) {
      // If hide completed is checked, filter tasks
      return Tasks.find({ checked: { $ne: true } }, {sort: { createdAt: -1}});
    }
    // Otherwise, return all of the tasks
    return Tasks.find({}, { sort: { createdAt: 1 } });
  },
  incompleteCount() {
    return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: 1 }}).count();

  },
});

Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.text.value;
 
    // Insert a task into the collection
    Tasks.insert({
      text,
      createdAt: new Date(), // current time
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });
 
    // Clear form
    target.text.value = '';
    $('html, body').scrollTop($(document).height() - $(window).height());
  },
  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },
});

Template.loginButtons.rendered = function()
{
    if(Meteor.user() == null){
      Accounts._loginButtonsSession.set('dropdownVisible', true);
    }
};