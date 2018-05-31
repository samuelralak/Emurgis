import { chai, assert } from 'chai'
import { Meteor } from 'meteor/meteor'
import { Problems } from "./problemCollection.js"
import { callWithPromise } from '/imports/api/utilities'
import './problemMethods.js'


Meteor.userId = () => 'test-user' // override the meteor userId, so we can test methods that require a user
Meteor.users.findOne = () => ({
    username: 'test'
}) // stub user data as well
Meteor.user = ()=> ({
    username: 'test'
})

describe('problem methods', () => { 
    beforeEach(() => {
        Problems.insert({
            summary: "Derp",
            description: "Lorem ipsum, herp derp durr.",
            solution: "Lorem ipsum, herp derp durr.",
            createdAt: new Date().getTime(),
            createdBy: ''
        })
    })

    it('can mark problem as resolved if current user is claimer', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : Meteor.userId() }
        })

        return callWithPromise('markAsResolved', { 
            problemId: problem._id, 
            claimerId: Meteor.userId()
        }).then(problemId => {
            let problem = Problems.findOne({ _id : problemId})
            assert(problem.status === 'ready for review')
        })

    })

	it('cannot mark problem as resolved if current user isnt claimer', () => {
        let problem = Problems.findOne({})
        assert.ok(problem)

        Problems.update({ _id : problem._id }, {
            $set : { claimedBy : 'fake-claimer' }
        })

        return callWithPromise('markAsResolved', { 
            problemId: problem._id, 
            claimerId: 'fake-claimer'
        }).then(data => {
            assert.isNull(data)
        }).catch(err => {
            assert.include(err.message, 'You are not allowed to resolve this problem')
        })

    })

    after(function() {
        Problems.remove({})
    })
})