import { faker } from "@faker-js/faker";
var _ = require('lodash');
export function TemplateData() {

    const templateFirst = faker.name.firstName('male');
    const templateLast = faker.name.lastName();
    const templateJob = faker.name.jobTitle();
    const templateInterjection = faker.word.interjection();
    const templateCompany = faker.company.companyName();
    const templateBirthDay = faker.date.birthdate().toLocaleString();
    const skinColor = _.sample([
        "Brown",
        "Pale",
        "Tanned",
        "Red",
        "Undead green",
        "Undead blue",
        "Monster",
        "Sea people",
        "Yellow"
    ])
    const clothe = _.sample([
        "Hoodies",
        "Glove",
        "Shirt",
        "T-shirt",
        "Scarf",
    ])

    const mouth = _.sample([
        "Grumpy",
        "Tonge out",
        "Alien parasit",
        "Fierce",
        "Friendly",
        "Sneaky"
    ])

    const eyes = _.sample([
        "Stone",
        "Suspicious",
        "Alien parasit",
        "Fierce",
        "Friendly",
        "Sneaky"
    ])

    const nose = _.sample([
        "regular"
    ])

    const apparel = _.sample([
        "regular"
    ])

    const texture = _.sample([
        "Melty",
        "Metal",
        "Chip",
        "Furry"
    ])

    const shape = _.sample([
        "Rocker",
        "Fiver",
        "Winner",
        "Oker",
        "Out sider",
        "Cautioneer"
    ])

    const tip = _.sample([
        "Ground break",
        "Hole",
        "Ripped"
    ])

    return {
        name:`${templateFirst} ${templateLast}`,
        mutable: [
            { "key": "rlmultiplier", "value": ["uint32", Math.floor(Math.random()*35)] }
        ],
        immutable: [
            { "key": "name", "value": ["string", `${templateFirst} ${templateLast}`] },
            { "key": "img", "value": ["string", `QmWnsy3269XJejJvyZjYKtDLJLXwM4CERbiVEURm8EKXni`] },
            { "key": "description", "value": ["string", `${templateInterjection.charAt(0).toUpperCase() + templateInterjection.slice(1)}, i'm ${templateFirst} ${templateLast}, a ${templateJob} that work at ${templateCompany}, with a bunch of ${faker.word.adjective()} that ${faker.company.catchPhrase()}`] },
            { "key": "url", "value": ["string", `https://5fhc.com`] },
            { "key": "birthdate", "value": ["string", `${templateBirthDay}`] },
            { "key": "jobtitle", "value": ["string", `${templateJob}`] },
            { "key": "company", "value": ["string", `${templateCompany}`] },
            { "key": "skincolor", "value": ["string", `${skinColor}`] },
            { "key": "mouth", "value": ["string", `${mouth}`] },
            { "key": "eyes", "value": ["string", `${eyes}`] },
            { "key": "nose", "value": ["string", `${nose}`] },
            { "key": "clothe", "value": ["string", `${clothe}`] },
            { "key": "apparel", "value": ["string", `${apparel}`] },
            { "key": "texture", "value": ["string", `${texture}`] },
            { "key": "shape", "value": ["string", `${shape}`] },
            { "key": "tip", "value": ["string", `${tip}`] }
        ]
    }

}