const { defineAbility } = require('@casl/ability');

const defineRulesFor = (user) => {
  if(user){
    const rules = defineAbility((can) => {
      user.authorizationIds.forEach(auth => {
        let actions = auth.actions
        let subject = auth.subject
        Object.entries(actions).forEach(([key, value]) => {
          if(value){
            if(subject === 'Billing'){
              can(key, subject)
              can(key, 'Detail')
            }else{
              can(key, subject)
            }
          }
        })
      })
    })
    return rules.rules
  }
}

module.exports = { defineRulesFor }
