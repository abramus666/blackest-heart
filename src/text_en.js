
var TEXT = {

   DEATH: 'YOU DIED.\nClick to try again.',

   NO_EFFECT:     'No effect.',
   NOT_AVAILABLE: 'Not available.',
   MAX_REACHED:   'Maximum level reached.',
   REJECT:        'Reject.',
   HEALED:        'All your wounds are fully healed.',
   OPENED:        'A gate has been opened somewhere.',
   DEFILEMENT:    'It seems that your disrespect has angered\n'+
                  'ancient gods this altar is dedicated to...',

   DEPTH_STATUS: function (n) {
      return 'You are at depth % of the dungeon.'.replace('%', n);
   },
   DEATH_STATUS: function (n) {
      if (n == 0) return 'You never died.';
      if (n == 1) return 'You died once.';
      if (n >= 2) return 'You died % times.'.replace('%', n);
   },
   KILLS_STATUS: function (n) {
      if (n == 0) return 'You never slayed any foe.';
      if (n == 1) return 'You slayed one foe:';
      if (n >= 2) return 'You slayed % foes in total:'.replace('%', n);
   },
   CREATURE_COUNT: {
      assassin: function (n) {return ((n == 1) ? '% assassin' : '% assassins').replace('%', n);},
      beast:    function (n) {return ((n == 1) ? '% beast'    : '% beasts'   ).replace('%', n);},
      demon:    function (n) {return ((n == 1) ? '% demon'    : '% demons'   ).replace('%', n);},
      golem:    function (n) {return ((n == 1) ? '% golem'    : '% golems'   ).replace('%', n);},
      hybrid:   function (n) {return ((n == 1) ? '% hybrid'   : '% hybrids'  ).replace('%', n);},
      knight:   function (n) {return ((n == 1) ? '% knight'   : '% knights'  ).replace('%', n);},
      minotaur: function (n) {return ((n == 1) ? '% minotaur' : '% minotaurs').replace('%', n);},
      shaman:   function (n) {return ((n == 1) ? '% shaman'   : '% shamans'  ).replace('%', n);},
      skull:    function (n) {return ((n == 1) ? '% skull'    : '% skulls'   ).replace('%', n);},
      vampire:  function (n) {return ((n == 1) ? '% vampire'  : '% vampires' ).replace('%', n);},
      wraith:   function (n) {return ((n == 1) ? '% wraith'   : '% wraiths'  ).replace('%', n);},
      zombie:   function (n) {return ((n == 1) ? '% zombie'   : '% zombies'  ).replace('%', n);},
   },

   KICK_INFO: ['Martial Arts',
      'Increases kick strength.',
      'Allows to perform swinging kicks which hit multiple opponents.',
      'Allows to perform spinning kicks which hit all nearby opponents.'
   ],
   JUMP_INFO: ['Acrobatics',
      'Increases jump distance.',
      'Increases jump distance.',
      'Allows to kill foes by jumping and landing on them.'
   ],
   SPELL_INFO: ['Spellcraft',
      'Increases damage caused by spell attacks and their range.',
      'Increases damage caused by spell attacks and their range.',
      'Increases damage caused by spell attacks and their range.'
   ],
   SWORD_INFO: ['Swordsmanship',
      'Increases damage caused by sword attacks.',
      'Increases damage caused by sword attacks.',
      'Increases damage caused by sword attacks.'
   ],
   VITALITY_INFO: ['Vitality',
      'Increases health.',
      'Increases health.',
      'Increases health. Allows to regain lost health by killing foes.'
   ],
   ENDURANCE_INFO: ['Endurance',
      'Increases stamina.',
      'Increases stamina and its regeneration rate.',
      'Increases stamina and its regeneration rate.'
   ],

   MAP_TRANSITION: [
      ['altar',     "Rumors say that praying at the altars of ancient gods\n"+
                    "can sometimes summon a hellish demon."],
      ['fountain',  "Pure fountain water can heal the most horrible wounds.\n"+
                    "But once contaminated with blood,\n"+
                    "fountain loses its miraculous properties."],
      ['assassin',  "Assassins are known for their proficiency in using shuriken.\n"+
                    "And for the fingers they lose during practice."],
      ['beast',     "Beasts have a habit of testing conduction of everyone they meet."],
      ['beast',     "It's hard to find an adventurer who hasn't been\n"+
                    "electrocuted by a beast at least once in his life."],
      ['demon',     "Demons love flames and swimming in lava pools."],
      ['demon',     "Demons are so hot they need to move constantly\n"+
                    "to not collapse into the core of the earth."],
      ['hybrid',    "Rumors say that demons and beasts are kin,\n"+
                    "and that they have a truly nightmarish cousin."],
      ['golem',     "Golems would laugh at spellcasters,\n"+
                    "if laughing ability was within their reach."],
      ['golem',     "Golems like rocks. Rocks like golems too."],
      ['knight',    "Rumors say that knights are exiled to underground\n"+
                    "dungeons as a punishment for eating their horses."],
      ['lilith',    "The wisest scholars can't count all monstrosities\n"+
                    "that came out of Lilith's rotten womb."],
      ['lilith',    "Nobody knows who's the father of all\n"+
                    "the abominations Lilith gave birth to.\n"+
                    "Some say he was eaten alive by his offspring."],
      ['lilith',    "Rumors say that a tiny fragment of Lilith's\n"+
                    "black heart dies every time a righteous man\n"+
                    "slays one of her abhorrent children."],
      ['minotaur',  "Minotaurs don't seem like dangerous foes,\n"+
                    "but every adventurer should watch out for their charges."],
      ['minotaur',  "Nobody knows how could minotaurs\n"+
                    "get here unnoticed from Crete."],
      ['shaman',    "Shamans know a thing or two about arcane magic."],
      ['shaman',    "Shamans hide many skulls in their pockets."],
      ['skull',     "Skulls are specialists in suicide bombings."],
      ['vampire',   "Vampires are very eager to try blood\n"+
                    "of every new victim they come across."],
      ['vampire',   "Rumors say that vampire wings are not only a decoration."],
      ['wraith',    "Wraiths are transcendental creatures,\n"+
                    "but they are susceptible to arcane magic."],
      ['wraith',    "Wraiths are partly transparent,\n"+
                    "what helps when fighting multiple foes."],
      ['zombie',    "Zombies are some of the wisest creatures.\n"+
                    "They happily offer advice in exchange for some brains."],
      ['hud_end',   "Adventurers with great endurance\n"+
                    "recover from fatigue much faster."],
      ['hud_jump',  "Adventurers with proficiency in acrobatics\n"+
                    "are able to jump on their foes, crushing them."],
      ['hud_kick',  "Adventurers with proficiency in martial arts\n"+
                    "can make multiple foes unconscious with a single kick."],
      ['hud_spell', "Adventurers with proficiency in spellcraft\n"+
                    "can slaughter any foe in sight with magical attacks."],
      ['hud_sword', "Adventurers with proficiency in swordsmanship\n"+
                    "are able to slay any foe with a single slash."],
      ['hud_vit',   "Adventurers with great vitality\n"+
                    "are capable of regaining lost health\n"+
                    "by taking the essence of killed foes."]
   ],

   LILITH_WELCOME:  ["Oh how interesting! A mortal with the audacity\n"+
                     "to come to my place, and disturb my peace.\n"+
                     "I haven't experienced such oddity since millennia!\n"+
                     "Don't you know who I am?",
                     //////////
                     "I will teach you a lesson, little girl.\n"+
                     "A lesson you won't forget until your death.\n"+
                     "Which will happen in a moment."],

   LILITH_GOODBYE:  ["You are the worst scum the earth gave birth to.\n"+
                     "I will cause you unimaginable pain... Later...\n"+
                     "We will meet again, I promise!"],

   LILITH_BIRTH:    ["Ohhh yes, yesss!!!\n"+
                     "Come on my children...\n"+
                     "Kill her... For me!",
                     //////////
                     "Yesss! Ahhh... My babies...\n"+
                     "Will slaughter you... And I...\n"+
                     "Will feel pleasure watching it!",
                     //////////
                     "Aaargh!!! Come out already!"],

   LILITH_LAUGH:    ["Ha ha ha ha ha!\nYour blood is everywhere!",
                     "Ha ha ha ha ha!\nI can see your guts!",
                     "Ha ha ha ha ha!\nDo you suffer already?"],

   LILITH_TALK:     ["I will tear out your heart, eyes and tongue!",
                     "I will rip your limbs and feed them to my children!",
                     "I will laugh looking at your mutilated body!"],

   START_MONOLOGUE: ["Congratulations! You completed the tutorial!\n"+
                     "Now please listen to me, as I have\n"+
                     "something very important to tell you.",
                     //////////
                     "Our land has suffered a terrible fate!\n"+
                     "An evil demon from the deepest abyss of hell\n"+
                     "arrived to haunt our homes, kidnap our children,\n"+
                     "cause deaths of thousands innocents!",
                     //////////
                     "She found her shelter in the dungeon below.\n"+
                     "There must be somebody capable of going there\n"+
                     "and ending this horror!",
                     //////////
                     "I believe you are brave enough!\n"+
                     "Please enter the dungeon, and banish that\n"+
                     "bloodthirsty devil back to where she came from!"],

   FINAL_MONOLOGUE: ["Congratulations! You defeated Lilith!\n"+
                     "You earned the eternal gratitude\n"+
                     "of the people of this land!",
                     //////////
                     "You can explore deeper areas of this dungeon.\n"+
                     "But beware! They are much more dangerous!"],

   START_MESSAGES: {
      a: "Welcome, fellow adventurer! If you are new,\n"+
         "please visit the tutorial section east from here.\n"+
         "Otherwise, you can enter the dungeon through that\n"+
         "hole in the ground right there. (Points south.)",
      b: "You can perform an attack by moving\n"+
         "towards an opponent. Try it on me.",
      c: "You can also perform an attack by moving\n"+
         "between two spots adjacent to an opponent.",
      d: "You can jump by pressing the middle button\n"+
         "at the bottom of the screen, and then\n"+
         "selecting one of the highlighted spots.\n"+
         "Try to jump over the lava.",
      e: "A jump can also be followed by an attack.\n"+
         "Try to jump over me to see how it works.",
      f: "Hey! Jump towards me!",
      g: "You can kick an opponent using the left button.\n"+
         "This will push him farther away from you.\n"+
         "Try to push me into the lava.",
      h: "You can cast a spell using the right button.\n"+
         "This allows you to attack from a distance.",
      i: "Note that jumping, kicking and casting spells\n"+
         "depletes stamina, so you will need some breaks.",
      j: "There are enemies in the room there. (Points west.)\n"+
         "Click on them to see which spots they can attack.\n"+
         "This is your final test. Defeat them!"
   }
};
