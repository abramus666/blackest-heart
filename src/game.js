
var SIGHT_DISTANCE   = 6;
var STAMINA_POINT    = 3;

// Creature attack range, from shortest to longest:
var WRAITH_RANGE     = 2;
var BEAST_RANGE      = 3;
var GOLEM_RANGE      = 4;
var VAMPIRE_RANGE    = 4;
var ASSASSIN_RANGE   = 5;
var DEMON_RANGE      = 5;
var SHAMAN_RANGE     = 5;

// Creature health, from weakest to strongest:
var SKULL_HEALTH     = 1;
var ASSASSIN_HEALTH  = 2;
var KNIGHT_HEALTH    = 2;
var SHAMAN_HEALTH    = 2;
var GOLEM_HEALTH     = 3;
var MINOTAUR_HEALTH  = 3;
var WRAITH_HEALTH    = 3;
var BEAST_HEALTH     = 4;
var DEMON_HEALTH     = 4;
var HYBRID_HEALTH    = 4;
var VAMPIRE_HEALTH   = 4;

// Zombies are not aggressive.
var ZOMB_MSGR_HEALTH = 1;
var ZOMB_SAGE_HEALTH = 100;

var MISSILE_MIN_DIST = 2;  // Minimum distance from the player for certain ranged attacks.
var SHAMAN_DELAY     = 3;  // Number of idle rounds between spawning skulls.
var SHAMAN_MIN_DIST  = 3;  // Minimum distance from the player for spawning skulls.
var SKULL_SPEED      = 3;  // How many hexagons can skull move through in one round.
var VAMPIRE_SPEED    = 2;  // How many hexagons can vampire move through in one round.

var TALK_DISTANCE    = 3;  // Maximum distance from the player for talking.
var TALK_LINE_LENGTH = 40; // Break into new line after reaching this line length.

var DISPLAY_TEXT_TIME = 3000;
var ANIM_DEFAULT_TIME = 400;
var ANIM_MELEE_TIME   = 300;
var ANIM_WALK_TIME    = 200;
var ANIM_ARC_HEIGHT   = 1.0;
var ANIM_MELEE_RATIO  = 0.75;

var BKGND_COLOR = 'black';
var FONT_COLOR  = 'white';
var FONT_NAME   = '16px Calibri';
var FONT_SIZE   = 16;
var INTERSPACE  = 8;

// Clockwise order. Needed for kick logic.
var DIR_NULL = -1;
var DIR_W    = 0;
var DIR_NW   = 1;
var DIR_NE   = 2;
var DIR_E    = 3;
var DIR_SE   = 4;
var DIR_SW   = 5;
var NUM_DIRS = 6;

var OPPOSITE_DIR = [DIR_E, DIR_SE, DIR_SW, DIR_W, DIR_NW, DIR_NE];

var HEX_GROUND = 0;
var HEX_LAVA   = 1;
var HEX_WALL   = 2;

var DAMAGE_PHYSICAL  = 0;
var DAMAGE_MAGIC     = 1;
var DAMAGE_FIRE      = 2;
var DAMAGE_LIGHTNING = 3;

var ACTION_DEFAULT = 0;
var ACTION_KICK    = 1;
var ACTION_JUMP    = 2;
var ACTION_SPELL   = 3;

var HEX_WIDTH, HEX_HEIGHT, VERT_HEX_DELTA, VERT_ENTITY_DELTA, VIEW_WIDTH, VIEW_HEIGHT;

var g_mousepos   = {x:0, y:0};
var g_inputlock  = false;
var g_map        = null;
var g_hud        = null;
var g_player     = null;
var g_mapstrings = [];
var g_difficulty = 0;

//==============================================================================
//    M A P    C R E A T I O N    F U N C T I O N S
//==============================================================================

function createHostileCreature(hex, map_chr) {
   if      (map_chr == 'A') return createAssassin(hex);
   else if (map_chr == 'B') return createBeast(hex);
   else if (map_chr == 'D') return createDemon(hex);
   else if (map_chr == 'G') return createGolem(hex);
   else if (map_chr == 'H') return createHybrid(hex);
   else if (map_chr == 'K') return createKnight(hex);
   else if (map_chr == 'L') return createLilith(hex);
   else if (map_chr == 'M') return createMinotaur(hex);
   else if (map_chr == 'S') return createShaman(hex);
   else if (map_chr == 'V') return createVampire(hex);
   else if (map_chr == 'W') return createWraith(hex);
   else return null;
}

function createHexagon(map_chr, map_msg) {
   var hex = {
      neighbors: [null, null, null, null, null, null],
      creature: null,
      effect: null,
      touch_id: 0
   };
   if (map_chr == '=') {
      g_map.gates.push(hex);
      hex.kind = HEX_WALL;
      hex.img = document.getElementById('gate');
   } else if (map_chr == '#') {
      hex.kind = HEX_WALL;
      hex.img = document.getElementById('wall');
   } else if (map_chr == '_') {
      hex.kind = HEX_LAVA;
      hex.img  = document.getElementById('lava');
      hex.img0 = document.getElementById('lava0');
   } else {
      hex.kind = HEX_GROUND;
      hex.img  = document.getElementById('ground');
      hex.img0 = document.getElementById('ground0');
      hex.creature = createHostileCreature(hex, map_chr);
      if (!hex.creature) {
         if      (map_chr == '@') {g_map.player_hex = hex;}
         else if (map_chr == '%') {g_map.spawn_points.push(hex);}
         else if (map_chr == '^') {hex.effect = createAltar(hex);}
         else if (map_chr == '+') {hex.effect = createFountain(hex);}
         else if (map_chr == '/') {hex.effect = createSwitch(hex);}
         else if (map_chr == '!') {hex.effect = createExit(hex);}
         else if (map_chr == '?') {hex.creature = createZombieSage(hex);}
         else if (map_chr != '.') {hex.creature = createZombieMsgr(hex, map_msg[map_chr]);}
      }
   }
   return hex;
}

function hexDictKey(x, y) {return x.toString() + ';' + y.toString();}
function hexDictKeyX(key) {return parseInt(key);}
function hexDictKeyY(key) {return parseInt(key.slice(key.search(';')+1));}

function createHexDict(map_str, map_msg) {
   var hex_dict = new Map();
   var i = 0, x = 0, y = 0;
   while (i < map_str.length) {
      if (map_str[i] == '\n') {
         i += 1;
         y += 1;
         x = 0;
      } else {
         if (map_str[i] != ' ') {
            hex_dict.set(hexDictKey(x,y), createHexagon(map_str[i], map_msg));
         }
         i += 1;
         x += 1;
      }
   }
   return hex_dict;
}

function setupHexNeighbors(hex_dict) {
   hex_dict.forEach(function (cur, key, dict) {
      var x = hexDictKeyX(key);
      var y = hexDictKeyY(key);
      var hex;
      if (hex = dict.get(hexDictKey(x-1,y-1))) {cur.neighbors[DIR_NW] = hex; hex.neighbors[DIR_SE] = cur;}
      if (hex = dict.get(hexDictKey(x+1,y-1))) {cur.neighbors[DIR_NE] = hex; hex.neighbors[DIR_SW] = cur;}
      if (hex = dict.get(hexDictKey(x-2,y  ))) {cur.neighbors[DIR_W]  = hex; hex.neighbors[DIR_E]  = cur;}
      if (hex = dict.get(hexDictKey(x+2,y  ))) {cur.neighbors[DIR_E]  = hex; hex.neighbors[DIR_W]  = cur;}
      if (hex = dict.get(hexDictKey(x-1,y+1))) {cur.neighbors[DIR_SW] = hex; hex.neighbors[DIR_NE] = cur;}
      if (hex = dict.get(hexDictKey(x+1,y+1))) {cur.neighbors[DIR_SE] = hex; hex.neighbors[DIR_NW] = cur;}
   });
}

function setupHexCoords() {
   traverseMap([g_map.player_hex], function (cur, came_from) {
      if (came_from) {
         cur.x = came_from.x;
         cur.y = came_from.y;
         if (cur === came_from.neighbors[DIR_NW]) {cur.x -= HEX_WIDTH/2; cur.y -= VERT_HEX_DELTA;}
         if (cur === came_from.neighbors[DIR_NE]) {cur.x += HEX_WIDTH/2; cur.y -= VERT_HEX_DELTA;}
         if (cur === came_from.neighbors[DIR_W])  {cur.x -= HEX_WIDTH;}
         if (cur === came_from.neighbors[DIR_E])  {cur.x += HEX_WIDTH;}
         if (cur === came_from.neighbors[DIR_SW]) {cur.x -= HEX_WIDTH/2; cur.y += VERT_HEX_DELTA;}
         if (cur === came_from.neighbors[DIR_SE]) {cur.x += HEX_WIDTH/2; cur.y += VERT_HEX_DELTA;}
      } else {
         cur.x = 0;
         cur.y = 0;
      }
      if (cur.kind == HEX_WALL) {
         // Adjust coordinates for wall hexagons, which are higher.
         // Altitude is needed for correct sorting of entities for drawing.
         cur.altitude = 0;
         cur.adjust_x = (HEX_WIDTH  - cur.img.width) / 2;
         cur.adjust_y = (HEX_HEIGHT - cur.img.height);
      }
   });
}

function initMap(level, map_str, map_msg, spawn_str) {
   g_map = {
      level:              level,
      map_string:         map_str,
      map_messages:       map_msg,
      spawn_strings:      spawn_str,
      spawn_points:       [],
      gates:              [],
      candidate_effects:  [],
      candidate_entities: [],
      candidate_floor:    [],
      candidate_walls:    [],
      visible_entities:   [],
      visible_floor:      [],
      visible_walls:      [],
      active_entities:    [],
      reachable_hexes:    [],
      unsafe_hexes:       [],
      unsafe_creature:    null,
      selected_hex:       null,
      player_hex:         null,
      touch_id:           0
   };
   setupHexNeighbors(createHexDict(map_str, map_msg));
   setupHexCoords();
}

function randomIndex(container) {
   return Math.floor(Math.random() * container.length);
}

function randomElement(container) {
   return container[randomIndex(container)];
}

function creatureCountCutoff(level) {
   if      (level <= 0) return 2.0;
   else if (level == 1) return 2.333;
   else if (level == 2) return 2.666;
   else if (level == 3) return 3.0;
   else if (level == 4) return 3.333;
   else if (level == 5) return 3.666;
   else if (level == 6) return 4.0;
   else if (level == 7) return 4.333;
   else if (level == 8) return 4.666;
   else if (level >= 9) return 5.0;
}

function creatureKindString(level) {
   // Characters are doubled so that up to two creatures can occur in a single spawn point.
   if      (level <= 0) return 'KK'; // Knight.
   else if (level == 1) return 'KKAA'; // Assassin added.
   else if (level == 2) return 'KKAAMM'; // Minotaur added.
   else if (level == 3) return 'KKAAMMGG'; // Golem added.
   else if (level == 4) return 'KKAAMMGGSS'; // Shaman added.
   else if (level == 5) return 'KKAAMMGGSSDD'; // Demon added.
   else if (level == 6) return 'KKAAMMGGSSDDVV'; // Vampire added.
   else if (level == 7) return 'KKAAMMGGSSDDVVBB'; // Beast added.
   else if (level == 8) return 'KKAAMMGGSSDDVVBBWW'; // Wraith added.
   else if (level >= 9) return 'KKAAMMGGSSDDVVBBWWHH'; // Hybrid added.
}

function randomSpawnString(level) {
   var spawn = [];
   var chars = [];
   var cutoff = creatureCountCutoff(level) + g_difficulty;
   var count = 0;
   while (cutoff >= 1.0) {
      count += 1;
      cutoff -= 1.0;
   }
   if (Math.random() < cutoff) {
      count += 1;
   }
   for (var i = 0; i < count; i++) {
      if (chars.length == 0) {
         chars = creatureKindString(level + g_difficulty).split('');
      }
      var ix = randomIndex(chars);
      var chr = chars.splice(ix,1)[0]; // Remove random character from the array.
      spawn.push(chr);
   }
   return spawn.join('');
}

//------------------------------------------------------------------------------
// Return a list containing the given hexagon, its neighbors, and its neighbors
// neighbors, in that order. Hexagons not appropriate for spawning creatures
// are not returned.
//------------------------------------------------------------------------------
function getSpawnPointHexes(spawn_point) {
   var neighbors = spawn_point.neighbors.filter(isHexEmptyGround);
   var hexes = [spawn_point].concat(neighbors);
   neighbors.forEach(function (start_hex) {
      start_hex.neighbors.forEach(function (hex) {
         if (isHexEmptyGround(hex) && !isHexPresentOnList(hex, hexes)) {
            hexes.push(hex);
         }
      });
   });
   return hexes;
}

function spawnRandomMapCreatures() {
   for (var i = 0; i < g_map.spawn_points.length; i++) {
      var hex = g_map.spawn_points[i];
      var str = g_map.spawn_strings[i];
      var hexes = getSpawnPointHexes(hex);
      for (var j = 0; j < hexes.length && j < str.length; j++) {
         hexes[j].creature = createHostileCreature(hexes[j], str[j]);
      }
   }
}

function generateMap(level) {
   var map_str = null;
   var map_msg = null;
   var level10 = level; // Level normalized to range from 0 to 10 (one game cycle).
   g_difficulty = 0;
   while (level10 > 10) {
      level10 -= 10;
      g_difficulty += 1; // Difficulty increases in later game cycles.
   }
   if (level10 == 0) {
      map_str = START_MAP;
      map_msg = TEXT.START_MESSAGES;
   } else if (level10 == 10) {
      map_str = FINAL_MAP;
   } else {
      if (g_mapstrings.length == 0) {
         g_mapstrings = [MAP1, MAP2];
      }
      var ix = randomIndex(g_mapstrings);
      map_str = g_mapstrings.splice(ix,1)[0]; // Remove random map string from the array.
   }
   initMap(level, map_str, map_msg, []);
   // Spawn strings are saved in the map object, therefore they are not generated
   // again on map restart. That way, if the player dies, the positions and types
   // of creatures on the map do not change.
   while (g_map.spawn_strings.length < g_map.spawn_points.length) {
      g_map.spawn_strings.push(randomSpawnString(level10));
   }
   spawnRandomMapCreatures();
}

function restartMap() {
   initMap(g_map.level, g_map.map_string, g_map.map_messages, g_map.spawn_strings);
   spawnRandomMapCreatures();
}

//==============================================================================
//    M A P    U T I L I T Y    F U N C T I O N S
//==============================================================================

function createQueue() {
   var head = null;
   var tail = null;
   return {
      put: function (item) {
         if (head) {
            tail.next = item;
         } else {
            head = item;
         }
         tail = item;
         item.next = null;
      },
      get: function () {
         var item = head;
         if (item) {
            head = item.next;
            item.next = null;
         }
         return item;
      }
   };
}

function isHexEmptyGround(hex) {
   return (hex && hex.kind == HEX_GROUND && !hex.creature);
}

function isHexPresentOnList(hex, list_of_hexes) {
   for (var i = 0; i < list_of_hexes.length; i++) {
      if (hex === list_of_hexes[i]) {
         return true;
      }
   }
   return false;
}

function areHexesNeighbors(hex1, hex2) {
   for (var i = 0; i < NUM_DIRS; i++) {
      if (hex1.neighbors[i] === hex2) {
         return true;
      }
   }
   return false;
}

function nextHexInLine(start_hex, end_hex) {
   for (var i = 0; i < NUM_DIRS; i++) {
      for (var hex = start_hex.neighbors[i]; hex; hex = hex.neighbors[i]) {
         if (hex === end_hex) {
            return hex.neighbors[i];
         }
      }
   }
   return null;
}

//------------------------------------------------------------------------------
// Return direction from start hexagon to target hexagon if they are in line,
// and there are no unavailable hexagons between them, and after target hexagon
// provided that minimum distance to verify (min_dist_verify) is large enough.
//
// Do not return the direction if the target is nearer than the specified
// minimum distance to target (min_dist_target).
//
// unavailable_func (hexagon, distance) => return hexagon_unavailable
//------------------------------------------------------------------------------
function determineLineAttackDir(start_hex, target_hex, min_dist_target, min_dist_verify, unavailable_func) {
   for (var i = 0; i < NUM_DIRS; i++) {
      var dir = DIR_NULL;
      var dist = 1;
      for (var hex = start_hex.neighbors[i]; (hex && hex.kind != HEX_WALL); hex = hex.neighbors[i]) {
         if (hex === target_hex && dist >= min_dist_target) {
            dir = i;
         }
         if (unavailable_func(hex, dist)) {
            dir = DIR_NULL;
            break;
         } else if (dist >= min_dist_verify && dir != DIR_NULL) {
            return dir;
         } else {
            dist += 1;
         }
      }
      if (dir != DIR_NULL) {
         return dir;
      }
   }
   return dir;
}

//------------------------------------------------------------------------------
// Determine staring hexagons for map traversal, used when creating a path for
// creatures with distance attacks. Returned array is sorted so that hexagons
// farther away from the player come first. This increases "priority" of such
// positions, what has obvious tactical advantages.
//
// unavailable_func (hexagon, distance) => return hexagon_unavailable
//------------------------------------------------------------------------------
function determineStartingHexes(min_dist_target, min_dist_verify, unavailable_func) {
   var hexes = [];
   for (var dir = 0; dir < NUM_DIRS; dir++) {
      var hex;
      var idist = 0;
      if (min_dist_verify > 0) {
         // If minimum distance to verify is specified, then check the opposite direction.
         var idir = OPPOSITE_DIR[dir];
         for (hex = g_map.player_hex.neighbors[idir]; (hex && hex.kind != HEX_WALL); hex = hex.neighbors[idir]) {
            if (unavailable_func(hex, idist + 1)) {
               break;
            }
            idist += 1;
            if (idist >= min_dist_verify) {
               break;
            }
         }
         // If null/wall hexagon is encountered, it means that hexagons in the opposite
         // direction are not a problem. Make sure minimum distance to verify will not
         // cause starting hexagons in this direction to be rejected.
         if (!hex || hex.kind == HEX_WALL) {
            idist = min_dist_verify;
         }
      }
      var dist = 1;
      for (hex = g_map.player_hex.neighbors[dir]; (hex && hex.kind != HEX_WALL); hex = hex.neighbors[dir]) {
         if (unavailable_func(hex, dist)) {
            break;
         } else if (dist >= min_dist_target && (dist + idist) >= min_dist_verify) {
            hex.distance = dist;
            hexes.push(hex);
         }
         dist += 1;
      }
   }
   hexes.sort(function (a, b) {return (b.distance - a.distance);});
   return hexes;
}

//------------------------------------------------------------------------------
// Traverse map starting from specified hexagons. Call the given function
// for each hexagon, passing the hexagon where we came from as the second
// argument. If the function returns true for any hexagon, then treat this
// haxagon as a dead end and don't continue traversal further from it.
//
// func (current_hexagon, came_from_hexagon) => return stop_traversal
//------------------------------------------------------------------------------
function traverseMap(starting_hexes, func) {
   var hexlist = createQueue();
   g_map.touch_id += 1;
   for (var i = 0; i < starting_hexes.length; i++) {
      var cur = starting_hexes[i];
      cur.touch_id = g_map.touch_id;
      if (!func(cur, null)) {
         hexlist.put(cur);
      }
   }
   while ((cur = hexlist.get()) != null) {
      for (var i = 0; i < NUM_DIRS; i++) {
         var neighbor = cur.neighbors[i];
         if (neighbor && neighbor.touch_id != g_map.touch_id) {
            neighbor.touch_id = g_map.touch_id;
            if (!func(neighbor, cur)) {
               hexlist.put(neighbor);
            }
         }
      }
   }
}

function updateDefaultPathInfo() {
   traverseMap([g_map.player_hex], function (cur, came_from) {
      if (cur.kind == HEX_GROUND) {
         cur.default_came_from = came_from;
         return false;
      } else {
         cur.default_came_from = null;
         return true;
      }
   });
}

function updatePathInfo(starting_hexes, move_through_lava) {
   var ending_hex_found = false;
   traverseMap(starting_hexes, function (cur, came_from) {
      if (cur.kind == HEX_GROUND || (cur.kind == HEX_LAVA && move_through_lava)) {
         cur.came_from = came_from;
         if (cur.creature) {
            return true;
         } else {
            return false;
         }
      } else {
         cur.came_from = null;
         return true;
      }
   });
}

function pathInfoCameFrom(hex, use_default) {
   if (hex.touch_id == g_map.touch_id) {
      return hex.came_from;
   } else if (use_default) {
      return hex.default_came_from;
   } else {
      return null;
   }
}

//------------------------------------------------------------------------------
// Return path distance between start hexagon and end hexagon,
// or (-1) if there is no path possible between these hexagons.
//------------------------------------------------------------------------------
function determinePathDistance(start_hex, end_hex, move_through_lava) {
   updatePathInfo([end_hex], move_through_lava);
   var dist = 0;
   for (var hex = start_hex; hex; hex = pathInfoCameFrom(hex, false)) {
      if (hex === end_hex) {
         return dist;
      } else {
         dist += 1;
      }
   }
   return -1;
}

//==============================================================================
//    D R A W I N G    F U N C T I O N S
//==============================================================================

//------------------------------------------------------------------------------
// Perform animation. Call the given function for each animation frame, passing
// animation position as the only argument. Animation position is in range from
// 0.0 to 1.0, with 1.0 guaranteed to be used for the last call.
//
// Disable input and hide highlight for the time of animation.
//------------------------------------------------------------------------------
function animate(duration, func) {
   var start_time = performance.now();
   g_player.message = null;
   drawHUD();
   lockInput();
   function tick(current_time) {
      var anim_pos = (current_time - start_time) / duration;
      if (anim_pos >= 1.0) {
         anim_pos = 1.0;
         unlockInput();
      }
      func(anim_pos);
      if (anim_pos < 1.0) {
         window.requestAnimationFrame(tick);
      }
   }
   window.requestAnimationFrame(tick);
}

function determineCandidatesForDrawing(start_x, start_y, end_x, end_y) {
   var left   = Math.min(start_x, end_x) - HEX_WIDTH * SIGHT_DISTANCE;
   var right  = Math.max(start_x, end_x) + HEX_WIDTH * SIGHT_DISTANCE + HEX_WIDTH;
   var top    = Math.min(start_y, end_y) - VERT_HEX_DELTA * SIGHT_DISTANCE;
   var bottom = Math.max(start_y, end_y) + VERT_HEX_DELTA * SIGHT_DISTANCE + HEX_HEIGHT;
   g_map.candidate_effects  = [];
   g_map.candidate_entities = [];
   g_map.candidate_floor    = [];
   g_map.candidate_walls    = [];
   traverseMap([g_map.player_hex], function (hex, came_from) {
      if (hex.kind == HEX_GROUND || hex.kind == HEX_LAVA) {
         var effect_or_entity = false;
         if (hex.effect) {
            var x = hex.x + hex.effect.adjust_x;
            var y = hex.y + hex.effect.adjust_y;
            if ((x < right)  && (x + hex.effect.img.width  > left) &&
                (y < bottom) && (y + hex.effect.img.height > top)) {
               g_map.candidate_effects.push(hex.effect);
               effect_or_entity = true;
            }
         }
         if (hex.creature) {
            var x = hex.x + hex.creature.adjust_x;
            var y = hex.y + hex.creature.adjust_y;
            if ((x < right)  && (x + hex.creature.img.width  > left) &&
                (y < bottom) && (y + hex.creature.img.height > top)) {
               g_map.candidate_entities.push(hex.creature);
               effect_or_entity = true;
            }
         }
         if ((hex.x < right)  && (hex.x + HEX_WIDTH  > left) &&
             (hex.y < bottom) && (hex.y + HEX_HEIGHT > top)) {
            g_map.candidate_floor.push(hex);
         } else if (effect_or_entity) {
            // This haxagon will not be rendered, but it needs
            // to be there so that its view_x/view_y are updated.
            g_map.candidate_floor.push(hex);
         }
      } else {
         var x = hex.x + hex.adjust_x;
         var y = hex.y + hex.adjust_y;
         if ((x < right)  && (x + hex.img.width  > left) &&
             (y < bottom) && (y + hex.img.height > top)) {
            g_map.candidate_walls.push(hex);
         }
      }
   });
}

function isVisible(object) {
   return (
      object.view_x > -object.img.width  && object.view_x < VIEW_WIDTH &&
      object.view_y > -object.img.height && object.view_y < VIEW_HEIGHT
   );
}

//------------------------------------------------------------------------------
// Update the entity view coordinates based on its requested animation, or view
// coordinates of the hexagon it is located in if no animation is defined.
// Return boolean value indicating whether the entity is visible or not.
//
// Animation is a table of numbers, with the following format:
//    [X0, Y0, (Hn, Xn, Yn)+]
// where H is an arc height used to achieve a curved movement path.
//------------------------------------------------------------------------------
function updateEntityViewInfo(entity, animate, anim_pos) {
   if (animate && (anim_pos < entity.show_pos || anim_pos > entity.hide_pos)) {
      return false;
   } else if (animate && entity.animation.length > 0) {
      var ix = 0;
      var pos = anim_pos * ((entity.animation.length - 2) / 3);
      while (pos > 1.0) {
         pos -= 1.0;
         ix += 3;
      }
      var x1 = entity.animation[ix];
      var y1 = entity.animation[ix+1];
      var h  = entity.animation[ix+2];
      var x2 = entity.animation[ix+3];
      var y2 = entity.animation[ix+4];
      entity.altitude = Math.sin(Math.PI * pos) * h;
      entity.view_x = (1.0 - pos) * x1 + pos * x2;
      entity.view_y = (1.0 - pos) * y1 + pos * y2 - entity.altitude;
   } else {
      entity.altitude = 0;
      entity.view_x = entity.hex.view_x;
      entity.view_y = entity.hex.view_y;
   }
   entity.view_x = Math.floor(entity.view_x + entity.adjust_x);
   entity.view_y = Math.floor(entity.view_y + entity.adjust_y);
   return isVisible(entity);
}

function updateEffectViewInfo(effect) {
   effect.view_x = Math.floor(effect.hex.view_x + effect.adjust_x);
   effect.view_y = Math.floor(effect.hex.view_y + effect.adjust_y);
   return isVisible(effect);
}

function drawFloor(center_x, center_y) {
   var ctx = document.getElementById('layer1').getContext('2d');
   var topleft_x = center_x - HEX_WIDTH * SIGHT_DISTANCE;
   var topleft_y = center_y - VERT_HEX_DELTA * SIGHT_DISTANCE;
   ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
   for (var i = 0; i < g_map.candidate_floor.length; i++) {
      var hex = g_map.candidate_floor[i];
      hex.view_x = Math.floor(hex.x - topleft_x);
      hex.view_y = Math.floor(hex.y - topleft_y);
      if (hex.view_x > -HEX_WIDTH  && hex.view_x < VIEW_WIDTH &&
          hex.view_y > -HEX_HEIGHT && hex.view_y < VIEW_HEIGHT) {
         ctx.drawImage((hex.lineofsight ? hex.img : hex.img0), hex.view_x, hex.view_y);
      }
   }
   g_map.candidate_effects.forEach(function (effect) {
      if (effect.hex.lineofsight) {
         if (updateEffectViewInfo(effect)) {
            ctx.drawImage(effect.img, effect.view_x, effect.view_y);
         }
      }
   });
}

//------------------------------------------------------------------------------
// Update visible floor-level hexagons. Not used for drawing.
//------------------------------------------------------------------------------
function updateVisibleFloor() {
   g_map.visible_floor = g_map.candidate_floor.filter(function (hex) {
      return isVisible(hex);
   });
}

//------------------------------------------------------------------------------
// Update visible entities for drawing during player movement.
// This includes walls and the player, which are all rendered together
// as the correct order of drawing is required.
//------------------------------------------------------------------------------
function updateVisibleEntities(center_x, center_y) {
   var topleft_x = center_x - HEX_WIDTH * SIGHT_DISTANCE;
   var topleft_y = center_y - VERT_HEX_DELTA * SIGHT_DISTANCE;
   g_map.visible_walls = g_map.candidate_walls.filter(function (hex) {
      hex.view_x = Math.floor(hex.x + hex.adjust_x - topleft_x);
      hex.view_y = Math.floor(hex.y + hex.adjust_y - topleft_y);
      return isVisible(hex);
   });
   g_map.visible_entities = g_map.visible_walls.concat(
      g_map.candidate_entities.filter(function (entity) {
         return (!entity.dead && entity.hex.lineofsight && updateEntityViewInfo(entity, false, 0));
      })
   );
   g_map.visible_entities.push(g_player);
}

//------------------------------------------------------------------------------
// Update visible entities for drawing during enemy turn, and player actions
// not involving movement. This function assumes that updateVisibleEntities
// was called before to determine visible walls.
//------------------------------------------------------------------------------
function updateVisibleEntitiesAnim(anim_pos) {
   g_map.visible_entities = g_map.visible_walls.concat(
      g_map.active_entities.filter(function (entity) {
         return (!entity.dead && entity.hex.lineofsight && updateEntityViewInfo(entity, true, anim_pos));
      })
   );
   g_map.visible_entities.push(g_player);
}

//------------------------------------------------------------------------------
// Draw entities. Calling updateVisibleEntities(Anim) first is required.
//------------------------------------------------------------------------------
function drawEntities() {
   var ctx = document.getElementById('layer3').getContext('2d');
   ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
   g_map.visible_entities.sort(function (a, b) {
      var diff = (a.view_y + a.img.height + a.altitude) - (b.view_y + b.img.height + b.altitude);
      if (diff == 0) {
         // We want temporary entities to be on top.
         if (a.temporary) {return +1;}
         if (b.temporary) {return -1;}
      }
      return diff;
   });
   g_map.visible_entities.forEach(function (entity) {
      ctx.drawImage(entity.img, entity.view_x, entity.view_y);
      if (entity.wounds > 0 && !entity.hide_healthbar) {
         drawHealthbar(ctx, entity);
      }
   });
}

function drawHealthbar(ctx, creature) {
   // Draw a combination of images for full and empty health bars, with the appropriate ratio.
   var img  = document.getElementById('healthbar');
   var img0 = document.getElementById('healthbar0');
   var health = 1.0 - (creature.wounds / (creature.max_health + g_difficulty));
   var w = Math.round(img.width * health);
   var w0 = img.width - w;
   var x = creature.view_x + creature.img.width/2 - img.width/2;
   var y = creature.view_y - img.height;
   ctx.drawImage(img,  0, 0, w,  img.height, x,   y, w,  img.height);
   ctx.drawImage(img0, w, 0, w0, img.height, x+w, y, w0, img.height);
}

function drawReachableHexes(ctx) {
   var img = document.getElementById('hex_reach');
   g_map.reachable_hexes.forEach(function (hex) {
      ctx.drawImage(img, hex.view_x, hex.view_y);
   });
}

function drawUnsafeHexes(ctx) {
   var img = document.getElementById('hex_unsafe');
   g_map.unsafe_hexes.forEach(function (hex) {
      ctx.drawImage(img, hex.view_x, hex.view_y);
   });
}

function drawSelectedHex(ctx) {
   var img = document.getElementById('hex_select');
   var hex = g_map.selected_hex;
   if (hex) {
      ctx.drawImage(img, hex.view_x, hex.view_y);
   }
}

function drawHighlight() {
   var ctx = document.getElementById('layer2').getContext('2d');
   ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
   drawReachableHexes(ctx);
   drawUnsafeHexes(ctx);
   drawSelectedHex(ctx);
}

function drawHealth(ctx) {
   var x = 0;
   for (var i = 0; i < g_player.max_health; i++) {
      var img;
      if (i < g_player.health) {
         img = g_hud.img_heal;
      } else if (i < g_player.health + g_player.lost_health) {
         img = g_hud.img_heal1;
      } else {
         img = g_hud.img_heal0;
      }
      ctx.drawImage(img, x, VIEW_HEIGHT - img.height);
      x += img.width;
   }
}

function drawStamina(ctx) {
   // Draw full stamina points.
   var cnt = g_player.stamina;
   var img = g_hud.img_stam;
   var x = VIEW_WIDTH;
   while (cnt >= STAMINA_POINT) {
      cnt -= STAMINA_POINT;
      x -= img.width;
      ctx.drawImage(img, x, VIEW_HEIGHT - img.height);
   }
   // If there is not full and not empty stamina point, draw it as a combination
   // of images for full and empty stamina points, with the appropriate ratio.
   if (cnt > 0) {
      var h = Math.round((img.height * cnt) / STAMINA_POINT);
      var h0 = img.height - h;
      x -= img.width;
      ctx.drawImage(g_hud.img_stam0, 0, 0, img.width, h0, x, VIEW_HEIGHT - img.height, img.width, h0);
      ctx.drawImage(g_hud.img_stam, 0, h0, img.width, h, x, VIEW_HEIGHT - img.height + h0, img.width, h);
   }
   // Draw empty stamina points.
   cnt = g_player.max_stamina - g_player.stamina;
   img = g_hud.img_stam0;
   while (cnt >= STAMINA_POINT) {
      cnt -= STAMINA_POINT;
      x -= img.width;
      ctx.drawImage(img, x, VIEW_HEIGHT - img.height);
   }
}

function drawButtons(ctx) {
   var img_kick, img_jump, img_spell;
   if (g_player.stamina >= STAMINA_POINT) {
      img_kick  = g_hud.img_kick;
      img_jump  = g_hud.img_jump;
      img_spell = g_hud.img_spell;
   } else {
      img_kick  = g_hud.img_kick0;
      img_jump  = g_hud.img_jump0;
      img_spell = g_hud.img_spell0;
   }
   if (g_hud.action == ACTION_KICK)  {img_kick  = g_hud.img_cancel};
   if (g_hud.action == ACTION_JUMP)  {img_jump  = g_hud.img_cancel};
   if (g_hud.action == ACTION_SPELL) {img_spell = g_hud.img_cancel};
   ctx.drawImage(img_kick,  g_hud.button_kick.left,  g_hud.button_kick.top);
   ctx.drawImage(img_jump,  g_hud.button_jump.left,  g_hud.button_jump.top);
   ctx.drawImage(img_spell, g_hud.button_spell.left, g_hud.button_spell.top);
}

function drawText(ctx, lines, pos_x, pos_y, align) {
   ctx.font = FONT_NAME;
   ctx.fillStyle = FONT_COLOR;
   ctx.textAlign = align;
   ctx.textBaseline = 'top';
   for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], pos_x, pos_y);
      pos_y += FONT_SIZE;
   }
}

function drawMessages(ctx) {
   g_map.visible_entities.forEach(function (entity) {
      if (entity.message) {
         var lines = entity.message.split('\n');
         var pos_x = entity.view_x + entity.img.width / 2;
         var pos_y = entity.view_y - lines.length * FONT_SIZE;
         drawText(ctx, lines, pos_x, pos_y, 'center');
      }
   });
}

function drawLevelUpMenu(ctx) {
   if (g_hud.levelup) {
      g_hud.levelup.forEach(function (item) {
         ctx.drawImage(item.img, item.button.left, item.button.top);
         if (item.info) {
            var lines = item.info.split('\n');
            var pos_x = item.button.right + INTERSPACE;
            var pos_y = item.button.top + (item.img.height - lines.length * FONT_SIZE) / 2;
            drawText(ctx, lines, pos_x, pos_y, 'left');
         }
      });
   }
}

function drawHUD() {
   var ctx = document.getElementById('layer4').getContext('2d');
   ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
   drawHealth(ctx);
   drawStamina(ctx);
   drawButtons(ctx);
   drawMessages(ctx);
   drawLevelUpMenu(ctx);
}

function drawTransitionScreen() {
   var ctx   = document.getElementById('layer4').getContext('2d');
   var item  = randomElement(TEXT.MAP_TRANSITION);
   var img   = document.getElementById(item[0]);
   var lines = item[1].split('\n');
   var img_x = (VIEW_WIDTH  - img.width)  / 2;
   var img_y = (VIEW_HEIGHT - img.height) / 2;
   var txt_x = VIEW_WIDTH / 2;
   var txt_y = (VIEW_HEIGHT + img.height) / 2 + INTERSPACE;
   var drawn = false;
   animate(DISPLAY_TEXT_TIME, function (anim_pos) {
      if (!drawn) {
         drawn = true;
         ctx.fillStyle = BKGND_COLOR;
         ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
         ctx.drawImage(img, img_x, img_y);
         drawText(ctx, lines, txt_x, txt_y, 'center');
      } else if (anim_pos == 1.0) {
         drawMapFirstPass();
      }
   });
}

//------------------------------------------------------------------------------
// This function is for the first pass only.
//------------------------------------------------------------------------------
function drawMapFirstPass() {
   var x = g_map.player_hex.x;
   var y = g_map.player_hex.y;
   determineCandidatesForDrawing(x, y, x, y);
   updateLineOfSightInfo();
   drawFloor(x, y);
   updateVisibleFloor();
   updateVisibleEntities(x, y);
   drawEntities();
   drawHUD();
}

//==============================================================================
//    P L A Y E R    F U N C T I O N S
//==============================================================================

function initPlayer() {
   g_player = {
      level:       0,
      health:      3,
      max_health:  3,
      stamina:     3 * STAMINA_POINT,
      max_stamina: 3 * STAMINA_POINT,
      vitality:    0,
      endurance:   0,
      skills: {
         kick:  0,
         jump:  0,
         spell: 0,
         sword: 0,
      },
      statistics: {
         sins:   0,
         deaths: 0,
         kills:  {total: 0}
      }
   };
   g_player.img_alive = document.getElementById('rogue');
   g_player.img_dead = document.getElementById('corpse');
   g_player.img = g_player.img_alive;
   g_player.view_x = (VIEW_WIDTH - g_player.img.width) / 2;
   g_player.view_y = (VIEW_HEIGHT - HEX_HEIGHT) / 2 + VERT_ENTITY_DELTA - g_player.img.height;
   g_player.view_y_base = g_player.view_y;
   g_player.altitude = 0;
   g_player.attacked_hexes = [];
   g_player.pending_effect = null;
   g_player.pending_damage = 0;
   g_player.lost_health = 0;
   g_player.lost_health_to_drop = 0;
   g_player.message = null;
}

function resetPlayer() {
   g_player.health  = g_player.max_health;
   g_player.stamina = g_player.max_stamina;
   g_player.img = g_player.img_alive;
}

function checkPlayerAttacks(camefrom_hex, current_hex) {
   var hexes = [];
   if (camefrom_hex !== current_hex) {
      var hex = nextHexInLine(camefrom_hex, current_hex);
      if (hex && hex.creature) {
         hexes.push(hex);
      }
      for (var i = 0; i < NUM_DIRS; i++) {
         hex = current_hex.neighbors[i];
         if (hex && hex.creature && areHexesNeighbors(hex, camefrom_hex)) {
            hexes.push(hex);
         }
      }
   }
   return hexes;
}

function damagePlayer() {
   g_player.pending_damage += 1;
}

function applyPendingPlayerDamage() {
   if (g_player.health > 0) {
      g_player.health -= g_player.pending_damage;
      if (g_player.health <= 0) {
         g_player.stamina = 0;
         g_player.statistics.deaths += 1;
         // Ancient gods have mercy: Reset sin count on death.
         g_player.statistics.sins = 0;
         g_player.lost_health = 0;
         g_player.lost_health_to_drop = 0;
         g_player.attacked_hexes = [];
         g_player.pending_effect = null;
         g_player.message = TEXT.DEATH;
         g_player.img = g_player.img_dead;
         drawEntities();
         lockInput();
      } else if (g_player.vitality >= 3) {
         // The highest vitality allows to regain lost health by killing creatures.
         g_player.lost_health += g_player.pending_damage;
      }
      drawHUD();
   }
   g_player.pending_damage = 0;
}

function playerDamageCreatureIfExists(creature, damage_type, damage_value) {
   var dead = false;
   if (creature) {
      damageCreatureIfExists(creature, damage_type, damage_value);
      dead = creature.dead;
      // Update statistics.
      if (dead) {
         g_player.statistics.kills.total += 1;
         if (g_player.statistics.kills[creature.name]) {
            g_player.statistics.kills[creature.name] += 1;
         } else {
            g_player.statistics.kills[creature.name] = 1;
         }
      }
      // Regain health if the player lost some recently, and a creature is killed.
      if (g_player.lost_health > 0 && dead) {
         g_player.lost_health -= 1;
         g_player.lost_health_to_drop -= 1;
         g_player.health += 1;
      }
      deleteDeadEntities();
   }
   return dead;
}

function regeneratePlayerStamina() {
   var inc = 1;
   if (g_player.endurance == 2) {inc = 2;}
   if (g_player.endurance >= 3) {inc = 3;}
   g_player.stamina = Math.min(g_player.stamina + inc, g_player.max_stamina);
}

function doPlayerPostProcessing_EnemyTurn() {
   applyPendingPlayerDamage();
   g_player.lost_health_to_drop = g_player.lost_health;
   // If the player has no stamina for an action, and there are no hexagons
   // accessible for the player to walk into, then perform another enemy turn.
   // But first, regenerate stamina since the player is not doing anything.
   var enemy_turn = false;
   if (g_player.health > 0 && g_player.stamina < STAMINA_POINT) {
      var accessible_hexes = g_map.player_hex.neighbors.filter(isHexEmptyGround);
      if (accessible_hexes.length == 0) {
         regeneratePlayerStamina();
         if (thinkEntities()) {
            moveEntities();
            enemy_turn = true;
         }
      }
   }
   if (g_player.pending_effect && !enemy_turn) {
      g_player.pending_effect.activate(g_player.pending_effect);
      g_player.pending_effect = null;
   }
}

function doPlayerPostProcessing_EndFrame(continue_func) {
   applyPendingPlayerDamage();
   if (g_player.attacked_hexes.length > 0) {
      doPlayerAttacks();
   } else {
      // At the end of player turn we want to prevent possibility of regaining
      // health lost in the last enemy turn, but leave possibility of regaining
      // health lost in the current player turn (i.e. exploding skulls).
      // This is why we are not zeroing lost_health here.
      if (g_player.lost_health_to_drop > 0) {
         g_player.lost_health -= g_player.lost_health_to_drop;
         g_player.lost_health_to_drop = 0;
         drawHUD();
      }
      if (thinkEntities()) {
         moveEntities();
      } else if (g_player.pending_effect) {
         g_player.pending_effect.activate(g_player.pending_effect);
         g_player.pending_effect = null;
      } else if (continue_func) {
         continue_func();
      }
   }
}

//------------------------------------------------------------------------------
// Temporary entities are not displayed during player movement and melee attacks,
// so we need to add a blood effect entity manually before drawing each frame.
// This function must be called after updateVisibleEntities.
//------------------------------------------------------------------------------
function doPlayerAttacks_createVisibleEntity(hex, img_name) {
   var entity = createEntity(hex, img_name, {});
   updateEntityViewInfo(entity, false, 0);
   g_map.visible_entities.push(entity);
}

function doPlayerAttacks() {
   var hex = g_player.attacked_hexes.shift();
   var x1 = g_map.player_hex.x;
   var y1 = g_map.player_hex.y;
   var x2 = (x1 * (1.0 - ANIM_MELEE_RATIO) + hex.x * ANIM_MELEE_RATIO);
   var y2 = (y1 * (1.0 - ANIM_MELEE_RATIO) + hex.y * ANIM_MELEE_RATIO);
   determineCandidatesForDrawing(x1, y1, x2, y2);
   animate(ANIM_MELEE_TIME, function (anim_pos) {
      var pos = anim_pos * 2.0;
      if (pos > 1.0) {
         pos = 2.0 - pos;
      }
      var x = (1.0 - pos) * x1 + pos * x2;
      var y = (1.0 - pos) * y1 + pos * y2;
      if (anim_pos == 1.0) {
         playerDamageCreatureIfExists(hex.creature, DAMAGE_PHYSICAL, (1 + g_player.skills.sword));
         g_player.draw_splash = false;
      }
      drawFloor(x, y);
      updateVisibleEntities(x, y);
      if (anim_pos < 0.5) {
         // Splash effect from the player jumping on a creature, crushing it.
         if (g_player.draw_splash) {
            doPlayerAttacks_createVisibleEntity(g_map.player_hex, 'splash');
         }
      } else if (anim_pos < 1.0) {
         // Blood is displayed only if a creature is hurt.
         if (creatureExistsAndIsNotImmune(hex.creature, DAMAGE_PHYSICAL)) {
            doPlayerAttacks_createVisibleEntity(hex, 'blood');
         }
      }
      drawEntities();
      drawHUD();
      if (anim_pos == 1.0) {
         updateVisibleFloor();
         doPlayerPostProcessing_EndFrame(null);
      }
   });
}

function doPlayerMovement(target_hex, arc_height, continue_func) {
   var duration = (arc_height > 0) ? ANIM_DEFAULT_TIME : ANIM_WALK_TIME;
   var start_hex = g_map.player_hex;
   determineCandidatesForDrawing(start_hex.x, start_hex.y, target_hex.x, target_hex.y);
   animate(duration, function (anim_pos) {
      var x = (1.0 - anim_pos) * start_hex.x + anim_pos * target_hex.x;
      var y = (1.0 - anim_pos) * start_hex.y + anim_pos * target_hex.y;
      if (anim_pos == 1.0) {
         g_player.attacked_hexes = checkPlayerAttacks(start_hex, target_hex);
         g_player.pending_effect = target_hex.effect;
         // Handle the case in which the player jumps on a creature, crushing it.
         g_player.draw_splash = playerDamageCreatureIfExists(target_hex.creature, DAMAGE_PHYSICAL, 999);
         // If enemy turn starts immediately after this animation ends (that is, there is no
         // player attack to perform), then add a temporary entity to display splash effect.
         if (g_player.draw_splash && g_player.attacked_hexes.length == 0) {
            g_player.draw_splash = false;
            var splash = createTemporaryEntity(target_hex, 'splash');
            splash.hide_pos = 1/3;
         }
         // Regenerate stamina but only when not jumping.
         if (arc_height == 0) {
            regeneratePlayerStamina();
         }
      }
      if (anim_pos >= 0.5 && g_map.player_hex !== target_hex) {
         // Change player position in the middle of movement.
         g_map.player_hex = target_hex;
         updateLineOfSightInfo();
      }
      g_player.altitude = Math.sin(Math.PI * anim_pos) * arc_height;
      g_player.view_y = g_player.view_y_base - g_player.altitude;
      drawFloor(x, y);
      updateVisibleEntities(x, y);
      drawEntities();
      drawHUD();
      if (anim_pos == 1.0) {
         updateVisibleFloor();
         doPlayerPostProcessing_EndFrame(continue_func);
      }
   });
}

function playerWalk(target_hex) {
   updatePathInfo([target_hex], false);
   var hex = pathInfoCameFrom(g_map.player_hex, false);
   if (hex && !hex.creature) {
      doPlayerMovement(hex, 0, function () {
         if (target_hex !== g_map.player_hex) {
            playerWalk(target_hex);
         }
      });
   }
}

function playerJump(target_hex) {
   doPlayerMovement(target_hex, ANIM_ARC_HEIGHT * HEX_HEIGHT, null);
}

function determinePlayerKickDirections(target_hex) {
   var dir = DIR_NULL;
   var dirs = [];
   if (g_player.skills.kick < 3) {
      for (dir = 0; dir < NUM_DIRS; dir++) {
         if (g_map.player_hex.neighbors[dir] === target_hex) {
            break;
         }
      }
      if (dir < NUM_DIRS) {
         hexes = [target_hex];
         dirs  = [dir];
         if (g_player.skills.kick == 2) {
            // Swinging kick hits in an arc up to three opponents.
            var dir1 = (dir == 0) ? (NUM_DIRS-1) : (dir-1);
            var dir2 = (dir == NUM_DIRS-1) ? 0 : (dir+1);
            var hex1 = g_map.player_hex.neighbors[dir1];
            var hex2 = g_map.player_hex.neighbors[dir2];
            if (hex1 && hex1.kind != HEX_WALL) {dirs.push(dir1);}
            if (hex2 && hex2.kind != HEX_WALL) {dirs.push(dir2);}
         }
      }
   } else {
      // Spinning kick hits all nearby opponents.
      dirs = g_map.player_hex.neighbors.filter(function (hex) {
         return (hex && hex.kind != HEX_WALL);
      });
   }
   return dirs;
}

function doPlayerKick_addAnimationDelays(creature, delay_before, delay_after) {
   if (delay_before > 0) {
      var first_segment = creature.animation.slice(0, 3);
      for (var i = 0; i < delay_before; i++) {
         creature.animation = first_segment.concat(creature.animation);
      }
   }
   if (delay_after > 0) {
      var last_segment = creature.animation.slice(-3);
      for (var i = 0; i < delay_after; i++) {
         creature.animation = creature.animation.concat(last_segment);
      }
   }
}

function doPlayerKick_pushedIntoLava(creature, anim_pos) {
   if (creatureExistsAndIsNotImmune(creature, DAMAGE_FIRE)) {
      // Create flames which will move along with the creature,
      // but show up only when the creature reaches lava.
      var flames = createTemporaryEntity(creature.hex, 'flames');
      flames.animation = creature.animation.slice();
      flames.show_pos = anim_pos;
      g_player.lava_kills.push(creature);
   }
}

function doPlayerKick(start_hex, direction, distance, delay) {
   var creature = start_hex.creature;
   var actual_distance = distance;
   var hex = start_hex;
   var i;
   // First, determine the possible distance of the creature travel after being kicked.
   // If we encounter another creature, we will call this function recursively.
   for (i = 0; i < distance; i++) {
      hex = hex.neighbors[direction];
      if (!hex || hex.kind == HEX_WALL) {
         actual_distance = i;
         break;
      } else if (hex.creature) {
         actual_distance = i + doPlayerKick(hex, direction, distance-i, delay+i);
         break;
      }
   }
   // When the actual distance is known, and other creatures are moved from our way,
   // then perform the travel. This is done one hexagon at a time, for correct animation.
   if (actual_distance > 0) {
      var lava_delay = -1;
      hex = start_hex;
      for (i = 0; i < actual_distance; i++) {
         hex = hex.neighbors[direction];
         creatureMove(creature, hex);
         if (lava_delay < 0 && hex.kind == HEX_LAVA) {
            lava_delay = i + 0.5; // This is for flames animation later.
         }
      }
      doPlayerKick_addAnimationDelays(creature, delay, distance - actual_distance);
      if (lava_delay > 0) {
         doPlayerKick_pushedIntoLava(creature, (delay + lava_delay) / (delay + distance));
      }
   }
   return actual_distance;
}

function playerKick(target_hex) {
   var dirs = determinePlayerKickDirections(target_hex);
   var dist = (g_player.skills.kick > 0) ? 3 : 1;
   g_player.lava_kills = [];
   dirs.forEach(function (dir) {
      var hex = g_map.player_hex.neighbors[dir];
      var smite = createTemporaryEntity(hex, 'smite');
      smite.hide_pos = 1/3;
      if (creatureExistsAndIsNotImmune(hex.creature, DAMAGE_PHYSICAL)) {
         hex.creature.stunned = true;
         doPlayerKick(hex, dir, dist, 0);
      }
   });
   animate(ANIM_DEFAULT_TIME, function (anim_pos) {
      if (anim_pos == 1.0) {
         deleteTemporaryEntities();
         // Kill creatures pushed into lava.
         g_player.lava_kills.forEach(function (creature) {
            playerDamageCreatureIfExists(creature, DAMAGE_FIRE, 999);
         });
         g_player.lava_kills = [];
      }
      updateVisibleEntitiesAnim(anim_pos);
      drawEntities();
      if (anim_pos == 1.0) {
         resetEntityAnimation();
         doPlayerPostProcessing_EndFrame(null);
      }
   });
}

function playerSpell(target_hex) {
   var projectile = createProjectileNoBlood(g_map.player_hex, target_hex, 0, 'spell');
   // Blood is displayed only if a creature is hurt.
   if (creatureExistsAndIsNotImmune(target_hex.creature, DAMAGE_MAGIC)) {
      createBlood(target_hex, projectile);
   }
   animate(ANIM_DEFAULT_TIME, function (anim_pos) {
      if (anim_pos == 1.0) {
         deleteTemporaryEntities();
         playerDamageCreatureIfExists(target_hex.creature, DAMAGE_MAGIC, (1 + g_player.skills.spell));
      }
      updateVisibleEntitiesAnim(anim_pos);
      drawEntities();
      if (anim_pos == 1.0) {
         doPlayerPostProcessing_EndFrame(null);
      }
   });
}

function calculateDistanceFromHex(hex, x, y) {
   var dx = hex.x - x;
   var dy = hex.y - y;
   return Math.sqrt(dx*dx + dy*dy);
}

function calculateAngleFromHex(hex, x, y) {
   var dx = hex.x - x;
   var dy = hex.y - y;
   return Math.atan2(dy, dx);
}

//------------------------------------------------------------------------------
// Remove the hexagons hidden (from the point of view of the given starting
// hexagon) behind the specified wall, and then return the remaining hexagons.
//------------------------------------------------------------------------------
function removeHexesHiddenBehindWall(start_hex, hexes_to_check, wall_hex) {
   // Special case in which atan2(dy,dx) goes from +PI to -PI.
   var special_angle_case = ((start_hex.y == wall_hex.y) && (start_hex.x < wall_hex.x));
   var distance = calculateDistanceFromHex(start_hex, wall_hex.x, wall_hex.y);
   var min_angle = +999;
   var max_angle = -999;
   // Helper function to calculate min and max angles, one hexagon vertex at once.
   function calculateMinMaxAngles(x, y) {
      var angle = calculateAngleFromHex(start_hex, x, y);
      if (special_angle_case) {
         if (angle > 0 && angle < min_angle) {min_angle = angle;} // Smallest positive number.
         if (angle < 0 && angle > max_angle) {max_angle = angle;} // Greatest negative number.
      } else {
         if (angle < min_angle) {min_angle = angle;}
         if (angle > max_angle) {max_angle = angle;}
      }
   }
   calculateMinMaxAngles(wall_hex.x, wall_hex.y - HEX_HEIGHT/2);
   calculateMinMaxAngles(wall_hex.x, wall_hex.y + HEX_HEIGHT/2);
   calculateMinMaxAngles(wall_hex.x - HEX_WIDTH/2, wall_hex.y - HEX_HEIGHT/4);
   calculateMinMaxAngles(wall_hex.x - HEX_WIDTH/2, wall_hex.y + HEX_HEIGHT/4);
   calculateMinMaxAngles(wall_hex.x + HEX_WIDTH/2, wall_hex.y - HEX_HEIGHT/4);
   calculateMinMaxAngles(wall_hex.x + HEX_WIDTH/2, wall_hex.y + HEX_HEIGHT/4);
   // Filter-out the hidden hexagons from the list.
   return hexes_to_check.filter(function (hex) {
      if (distance > calculateDistanceFromHex(start_hex, hex.x, hex.y)) {
         return true;
      } else {
         var angle = calculateAngleFromHex(start_hex, hex.x, hex.y);
         if (special_angle_case) {
            return (angle < min_angle && angle > max_angle);
         } else {
            return (angle < min_angle || angle > max_angle);
         }
      }
   });
}

//------------------------------------------------------------------------------
// Update information about line-of-sight from the player: Mark all visible
// floor-level (not walls) hexagons, which are not hidden behind any wall.
//------------------------------------------------------------------------------
function updateLineOfSightInfo() {
   var hexes = g_map.candidate_floor;
   hexes.forEach(function (hex) {
      hex.lineofsight = false;
   });
   g_map.candidate_walls.forEach(function (hex) {
      hexes = removeHexesHiddenBehindWall(g_map.player_hex, hexes, hex);
   });
   hexes.forEach(function (hex) {
      hex.lineofsight = true;
      if (hex.creature) {
         activateCreature(hex.creature);
      }
   });
}

//------------------------------------------------------------------------------
// Return all floor-level (not walls) visible hexagons, which are within an area
// surrounding the given spot. The area has a shape of a large hexagon with the
// given spot in the center. The center is not included in the returned list.
//------------------------------------------------------------------------------
function surroundingVisibleHexes(start_hex, max_distance) {
   var min_y = start_hex.y - (max_distance * VERT_HEX_DELTA);
   var max_y = start_hex.y + (max_distance * VERT_HEX_DELTA);
   var hexes_to_check = g_map.visible_floor;
   var hexes_in_range = [];
   for (var i = 0; i < hexes_to_check.length; i++) {
      var hex = hexes_to_check[i];
      if (hex !== start_hex) {
         if (hex.y >= min_y && hex.y <= max_y) {
            var dx = (Math.abs(hex.y - start_hex.y) / VERT_HEX_DELTA) * (HEX_WIDTH / 2);
            var min_x = start_hex.x - (max_distance * HEX_WIDTH) + dx;
            var max_x = start_hex.x + (max_distance * HEX_WIDTH) - dx;
            if (hex.x >= min_x && hex.x <= max_x) {
               hexes_in_range.push(hex);
            }
         }
      }
   }
   return hexes_in_range;
}

//------------------------------------------------------------------------------
// Return all floor-level (not walls) hexagons, which are within an area
// surrounding the player, and which are reachable for the player (that is,
// there is a line-of-sight from the player to the hexagon).
//------------------------------------------------------------------------------
function playerReachableHexes(max_distance) {
   return surroundingVisibleHexes(g_map.player_hex, max_distance).filter(function (hex) {
      return hex.lineofsight;
   });
}

//------------------------------------------------------------------------------
// Maximum range for a jump is four hexagons.
// The highest jump skill allows to land on a creature, crushing it
// (unless the creature is immune to physical attacks).
//------------------------------------------------------------------------------
function playerReachableHexesForJump() {
   var range = Math.min(2 + g_player.skills.jump, 4);
   return playerReachableHexes(range).filter(function (hex) {
      if (areHexesNeighbors(hex, g_map.player_hex) || hex.kind == HEX_LAVA) {
         return false;
      }
      if (hex.creature) {
         if (hex.creature.immunity_physical || g_player.skills.jump < 3) {
            return false;
         }
      }
      return true;
   });
}

function playerReachableHexesForKick() {
   return g_map.player_hex.neighbors.filter(function (hex) {
      return (hex && hex.kind != HEX_WALL);
   });
}

function playerReachableHexesForSpell() {
   return playerReachableHexes(2 + g_player.skills.spell);
}

//==============================================================================
//    E F F E C T    F U N C T I O N S
//==============================================================================

function createEffect(hex, img_name, activate_func) {
   var self = {
      hex: hex,
      img: document.getElementById(img_name),
      activate: activate_func
   };
   // Center the effect image over the ground image.
   self.adjust_x = (HEX_WIDTH  - self.img.width)  / 2;
   self.adjust_y = (HEX_HEIGHT - self.img.height) / 2;
   return self;
}

function createLevelUpItem(img_name, attr_value, attr_info, upgrade_func) {
   if (attr_value >= 0 && attr_value < 3) {
      var name  = attr_info[0] + ' +' + (attr_value + 1).toString() + '\n';
      var descr = attr_info[attr_value + 1];
      if (g_map.level > attr_value * 3) {
         return {image: img_name, info: (name + descr), message: (name + descr), func: upgrade_func};
      } else {
         return {image: (img_name + '0'), info: (name + TEXT.NOT_AVAILABLE), func: null};
      }
   } else {
      return {image: (img_name + '0'), info: (attr_info[0] + '\n' + TEXT.MAX_REACHED), func: null};
   }
}

function configureLevelUpButtons() {
   var y = 0;
   g_hud.levelup.forEach(function (item, index) {
      item.img = document.getElementById(item.image);
      if (index > 0) {y += INTERSPACE;}
      item.button = {top: y, left: VIEW_WIDTH/4};
      y += item.img.height;
   });
   // Update button rectangles so that they are centered vertically on screen.
   var dy = (VIEW_HEIGHT - y) / 2;
   g_hud.levelup.forEach(function (item) {
      item.button.top += dy;
      item.button.bottom = item.button.top + item.img.height;
      item.button.right = item.button.left + item.img.width;
   });
}

//------------------------------------------------------------------------------
// Violating an altar by either rejecting a blessing, or praying when
// a blessing has already been received, is considered a sin and can cause
// up to six demonic creatures to spawn around the player. Chance of it
// happening is tiny at first, but increases with each sin by 1/100th.
//------------------------------------------------------------------------------
function altarCheckDefilement() {
   g_player.statistics.sins += 1;
   if (Math.random() < g_player.statistics.sins / 100) {
      g_player.message = TEXT.DEFILEMENT;
      altarSpawnDemonicCreatures();
   }
}

function altarSpawnDemonicCreatures() {
   g_map.player_hex.neighbors.filter(isHexEmptyGround).forEach(function (hex) {
      hex.creature = createDemonicCreature(hex);
      activateCreature(hex.creature);
   });
   updateVisibleEntities(g_map.player_hex.x, g_map.player_hex.y);
   drawEntities();
}

function createAltar(hex) {
   return createEffect(hex, 'altar', function (self) {
      if (g_player.level >= g_map.level) {
         g_player.message = TEXT.NO_EFFECT;
         altarCheckDefilement(); // This function can overwrite the message.
      } else {
         g_hud.levelup = [
            createLevelUpItem('hud_kick', g_player.skills.kick, TEXT.KICK_INFO, function () {
               g_player.skills.kick += 1;
               g_player.level = g_map.level;
            }),
            createLevelUpItem('hud_jump', g_player.skills.jump, TEXT.JUMP_INFO, function () {
               g_player.skills.jump += 1;
               g_player.level = g_map.level;
            }),
            createLevelUpItem('hud_spell', g_player.skills.spell, TEXT.SPELL_INFO, function () {
               g_player.skills.spell += 1;
               g_player.level = g_map.level;
            }),
            createLevelUpItem('hud_sword', g_player.skills.sword, TEXT.SWORD_INFO, function () {
               g_player.skills.sword += 1;
               g_player.level = g_map.level;
            }),
            createLevelUpItem('hud_vit', g_player.vitality, TEXT.VITALITY_INFO, function () {
               g_player.vitality   += 1;
               g_player.health     += 2;
               g_player.max_health += 2;
               g_player.level = g_map.level;
            }),
            createLevelUpItem('hud_end', g_player.endurance, TEXT.ENDURANCE_INFO, function () {
               g_player.endurance   += 1;
               g_player.stamina     += 2 * STAMINA_POINT;
               g_player.max_stamina += 2 * STAMINA_POINT;
               g_player.level = g_map.level;
            }),
            // A button with an "empty" function so that it is possible
            // to exit level-up menu without actually upgrading anything.
            {image: 'hud_cancel', info: TEXT.REJECT, message: TEXT.NO_EFFECT, func: altarCheckDefilement}
         ];
         configureLevelUpButtons();
         lockInput();
      }
      drawHUD();
   });
}

function createFountain(hex) {
   return createEffect(hex, 'fountain', function (self) {
      if (self.used || g_player.health == g_player.max_health) {
         g_player.message = TEXT.NO_EFFECT;
      } else {
         self.used = true;
         g_player.health = g_player.max_health;
         g_player.message = TEXT.HEALED;
         self.img = document.getElementById('fountain0');
         drawFloor(g_map.player_hex.x, g_map.player_hex.y);
      }
      drawHUD();
   });
}

function switchOpenAllGates() {
   g_map.gates.forEach(function (hex) {
      hex.kind = HEX_GROUND;
      hex.img  = document.getElementById('gate0');
      hex.img0 = document.getElementById('ground0');
   });
   // Gates change from "wall" kind to "ground" kind, what means that we
   // need to redraw everything and update information about line-of-sight.
   drawMapFirstPass();
}

function createSwitch(hex) {
   return createEffect(hex, 'switch', function (self) {
      if (self.used) {
         g_player.message = TEXT.NO_EFFECT;
      } else {
         self.used = true;
         g_player.message = TEXT.OPENED;
         self.img = document.getElementById('switch0');
         switchOpenAllGates();
      }
      drawHUD();
   });
}

function createExit(hex) {
   return createEffect(hex, 'exit', function (self) {
      generateMap(g_map.level + 1);
      drawTransitionScreen();
   });
}

//==============================================================================
//    E N T I T Y    F U N C T I O N S
//==============================================================================

function createEntity(hex, img_name, properties) {
   var self = Object.create(properties);
   self.name      = img_name;
   self.hex       = hex;
   self.img       = document.getElementById(img_name);
   self.adjust_x  = (HEX_WIDTH - self.img.width) / 2;
   self.adjust_y  = (VERT_ENTITY_DELTA - self.img.height);
   self.view_x    = 0;
   self.view_y    = 0;
   self.altitude  = 0;
   self.activated = false;
   self.dead      = false;
   self.suicide   = false;
   self.stunned   = false;
   self.wounds    = 0;
   self.animation = [];
   self.show_pos  = 0;
   self.hide_pos  = 1;
   return self;
}

function killEntity(entity) {
   if (!entity.dead) {
      entity.dead = true;
      if (entity.die) {
         entity.die(entity);
      }
   }
}

//------------------------------------------------------------------------------
// think1 is for range attacks and explosions, if they can affect
// or depend on positions of other creatures. No movement is allowed.
// think2 is for the rest, including all movement.
//------------------------------------------------------------------------------
function thinkEntities() {
   updateDefaultPathInfo();
   var animate = false;
   g_map.active_entities.forEach(function (entity) {
      if (entity.suicide) {
         killEntity(entity);
      } else if (!entity.dead && !entity.stunned && entity.think1) {
         entity.think1(entity);
      }
   });
   g_map.active_entities.forEach(function (entity) {
      if (!entity.dead && !entity.stunned && entity.think2) {
         entity.think2(entity);
      } else {
         entity.stunned = false;
      }
   });
   g_map.active_entities.forEach(function (entity) {
      if (entity.temporary || entity.animation.length > 0) {
         animate = true;
      }
   });
   drawHUD(); // In case any creature says something.
   return animate;
}

function deleteDeadEntities() {
   g_map.active_entities = g_map.active_entities.filter(function (entity) {
      if (entity.dead) {
         if (entity.hex.creature === entity) {
            entity.hex.creature = null;
         }
      }
      return !entity.dead;
   });
}

function deleteTemporaryEntities() {
   g_map.active_entities = g_map.active_entities.filter(function (entity) {
      return !entity.temporary;
   });
}

function resetEntityAnimation() {
   g_map.active_entities.forEach(function (entity) {
      entity.animation = [];
   });
}

function moveEntities() {
   animate(ANIM_DEFAULT_TIME, function (anim_pos) {
      if (anim_pos == 1.0) {
         deleteDeadEntities();
         deleteTemporaryEntities();
         resetEntityAnimation();
         doPlayerPostProcessing_EnemyTurn();
      }
      updateVisibleEntitiesAnim(anim_pos);
      drawEntities();
   });
}

//==============================================================================
//    C R E A T U R E    A I    F U N C T I O N S
//==============================================================================

//------------------------------------------------------------------------------
// Activate the given creature and all the nearby creatures as well.
//------------------------------------------------------------------------------
function activateCreature(creature) {
   if (!creature.activated) {
      creature.activated = true;
      g_map.active_entities.push(creature);
      for (var i = 0; i < NUM_DIRS; i++) {
         var hex = creature.hex.neighbors[i];
         if (hex && hex.creature) {
            activateCreature(hex.creature);
         }
      }
   }
}

function creatureExistsAndIsNotImmune(creature, damage_type) {
   if      (!creature)                                                      return false;
   else if (damage_type == DAMAGE_PHYSICAL  && creature.immunity_physical)  return false;
   else if (damage_type == DAMAGE_MAGIC     && creature.immunity_magic)     return false;
   else if (damage_type == DAMAGE_FIRE      && creature.immunity_fire)      return false;
   else if (damage_type == DAMAGE_LIGHTNING && creature.immunity_lightning) return false;
   else                                                                     return true;
}

function damageCreatureIfExists(creature, damage_type, damage_value) {
   if (creatureExistsAndIsNotImmune(creature, damage_type)) {
      creature.stunned = true;
      creature.wounds += damage_value;
      if (creature.wounds >= (creature.max_health + g_difficulty)) {
         killEntity(creature);
      }
   }
}

function createTemporaryEntity(hex, img_name) {
   var entity = createEntity(hex, img_name, {temporary: true});
   g_map.active_entities.push(entity);
   return entity;
}

function createProjectileNoBlood(start_hex, end_hex, arc_height, img_name) {
   var projectile = createTemporaryEntity(end_hex, img_name);
   projectile.animation = [start_hex.view_x, start_hex.view_y];
   projectile.animation.push(arc_height, end_hex.view_x, end_hex.view_y);
   projectile.animation.push(0,          end_hex.view_x, end_hex.view_y);
   projectile.hide_pos = 0.5;
   return projectile;
}

function createProjectile(start_hex, end_hex, arc_height, img_name) {
   var projectile = createProjectileNoBlood(start_hex, end_hex, arc_height, img_name);
   createBlood(end_hex, projectile);
}

function createBlood(hex, parent_entity) {
   var blood = createTemporaryEntity(hex, 'blood');
   // Blood appears when the last segment of the parent entity animation starts.
   blood.show_pos = 1.0 - (3.0 / (parent_entity.animation.length - 2));
}

function creatureMove(self, target_hex) {
   if (target_hex && !target_hex.creature && target_hex !== g_map.player_hex) {
      if (self.animation.length == 0) {
         self.animation = [self.hex.view_x, self.hex.view_y];
      }
      self.animation.push(0, target_hex.view_x, target_hex.view_y);
      if (self.hex.creature === self) {
         self.hex.creature = null;
      }
      self.hex = target_hex;
      self.hex.creature = self;
   }
}

function creatureMeleeAttack(self, target_hex) {
   if (self.animation.length == 0) {
      self.animation = [self.hex.view_x, self.hex.view_y];
   }
   self.animation.push(0);
   self.animation.push(self.hex.view_x * (1.0 - ANIM_MELEE_RATIO) + target_hex.view_x * ANIM_MELEE_RATIO);
   self.animation.push(self.hex.view_y * (1.0 - ANIM_MELEE_RATIO) + target_hex.view_y * ANIM_MELEE_RATIO);
   self.animation.push(0);
   self.animation.push(self.hex.view_x);
   self.animation.push(self.hex.view_y);
   createBlood(target_hex, self);
}

function creatureJumpAttack(self, target_hex, end_hex) {
   if (self.animation.length == 0) {
      self.animation = [self.hex.view_x, self.hex.view_y];
   }
   self.animation.push(ANIM_ARC_HEIGHT * HEX_HEIGHT);
   self.animation.push(end_hex.view_x * (1.0 - ANIM_MELEE_RATIO) + target_hex.view_x * ANIM_MELEE_RATIO);
   self.animation.push(end_hex.view_y * (1.0 - ANIM_MELEE_RATIO) + target_hex.view_y * ANIM_MELEE_RATIO);
   creatureMove(self, end_hex, 0);
   createBlood(target_hex, self);
}

//------------------------------------------------------------------------------
// Knight attacks nearby hexagons.
//------------------------------------------------------------------------------
function createKnight(hex) {
   return createEntity(hex, 'knight', {
      max_health: KNIGHT_HEALTH, can_attack: canAttackKnight, think2: thinkKnight
   });
}

function canAttackKnight(self, target_hex) {
   return areHexesNeighbors(self.hex, target_hex);
}

function thinkKnight(self) {
   if (canAttackKnight(self, g_map.player_hex)) {
      creatureMeleeAttack(self, g_map.player_hex);
      damagePlayer();
   } else {
      updatePathInfo([g_map.player_hex], false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Minotaur attacks nearby hexagons, and also performs charge attacks
// (moves one haxagon, and attacks the next hexagon in line).
//------------------------------------------------------------------------------
function createMinotaur(hex) {
   return createEntity(hex, 'minotaur', {
      max_health: MINOTAUR_HEALTH, can_attack: canAttackMinotaur, think2: thinkMinotaur
   });
}

function unavailableForMinotaur(hex, distance) {
   return (distance > 2 || hex.kind != HEX_GROUND || hex.creature);
}

function canAttackMinotaur(self, target_hex) {
   self.dir = determineLineAttackDir(self.hex, target_hex, 0, 0, unavailableForMinotaur);
   return (self.dir != DIR_NULL);
}

function thinkMinotaur(self) {
   if (canAttackMinotaur(self, g_map.player_hex)) {
      if (self.hex.neighbors[self.dir] !== g_map.player_hex) {
         creatureMove(self, self.hex.neighbors[self.dir]);
      }
      creatureMeleeAttack(self, g_map.player_hex);
      damagePlayer();
   } else {
      updatePathInfo(determineStartingHexes(0, 0, unavailableForMinotaur), false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Vampire attacks nearby hexagons, and also performs long jumps
// followed by a lunge attack targeted at the next hexagon in line.
// Vampire moves faster than other creatures.
//------------------------------------------------------------------------------
function createVampire(hex) {
   return createEntity(hex, 'vampire', {
      max_health: VAMPIRE_HEALTH, can_attack: canAttackVampire, think2: thinkVampire
   });
}

function createUnavailableForVampire(target_hex) {
   return function (hex, distance) {
      // We need an empty ground hexagon to land on immediately before the target.
      if (areHexesNeighbors(hex, target_hex)) {
         if (hex.kind != HEX_GROUND || hex.creature) {
            return true;
         }
      }
      return (distance > VAMPIRE_RANGE);
   };
}

function canAttackVampire(self, target_hex) {
   self.dir = determineLineAttackDir(self.hex, target_hex, 0, 0, createUnavailableForVampire(target_hex));
   return (self.dir != DIR_NULL);
}

function thinkVampire(self) {
   if (canAttackVampire(self, g_map.player_hex)) {
      var moveto_hex = self.hex;
      while (moveto_hex.neighbors[self.dir] !== g_map.player_hex) {
         moveto_hex = moveto_hex.neighbors[self.dir];
      }
      if (self.hex === moveto_hex) {
         creatureMeleeAttack(self, g_map.player_hex);
      } else if (self.hex.neighbors[self.dir] === moveto_hex) {
         creatureMove(self, moveto_hex);
         creatureMeleeAttack(self, g_map.player_hex);
      } else {
         creatureJumpAttack(self, g_map.player_hex, moveto_hex);
      }
      damagePlayer();
   } else {
      updatePathInfo(determineStartingHexes(0, 0, createUnavailableForVampire(g_map.player_hex)), false);
      for (var i = 0; i < VAMPIRE_SPEED; i++) {
         creatureMove(self, pathInfoCameFrom(self.hex, true));
      }
   }
}

//------------------------------------------------------------------------------
// Wraith casts magic missiles which are not limited to fly in one of the six
// main directions only. This is unlike most other ranged creatures, and similar
// to the player spell abilities.
// Due to its transcendental nature, wraith is immune to physical damage.
//------------------------------------------------------------------------------
function createWraith(hex) {
   return createEntity(hex, 'wraith', {
      immunity_physical: true,
      max_health: WRAITH_HEALTH,
      can_attack: canAttackWraith,
      think2: thinkWraith
   });
}

function canAttackWraith(self, target_hex) {
   if (!self.can_attack_hexes) {
      self.can_attack_hexes = surroundingVisibleHexes(self.hex, WRAITH_RANGE);
      g_map.visible_walls.forEach(function (hex) {
         self.can_attack_hexes = removeHexesHiddenBehindWall(self.hex, self.can_attack_hexes, hex);
      });
   }
   return isHexPresentOnList(target_hex, self.can_attack_hexes);
}

function thinkWraith(self) {
   if (isHexPresentOnList(self.hex, playerReachableHexes(WRAITH_RANGE))) {
      createProjectile(self.hex, g_map.player_hex, 0, 'spell');
      damagePlayer();
   } else {
      updatePathInfo([g_map.player_hex], false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
      self.can_attack_hexes = null;
   }
}

//------------------------------------------------------------------------------
// Golem throws rocks. Rocks fly above creatures which are between golem
// and the player. Rocks can only be thrown if the player is not too close.
// Golem is immune to magic damage.
//------------------------------------------------------------------------------
function createGolem(hex) {
   return createEntity(hex, 'golem', {
      immunity_magic: true,
      max_health: GOLEM_HEALTH,
      can_attack: canAttackGolem,
      think2: thinkGolem
   });
}

function unavailableForGolem(hex, distance) {
   return (distance > GOLEM_RANGE);
}

function canAttackGolem(self, target_hex) {
   self.dir = determineLineAttackDir(self.hex, target_hex, MISSILE_MIN_DIST, 0, unavailableForGolem);
   return (self.dir != DIR_NULL);
}

function thinkGolem(self) {
   if (canAttackGolem(self, g_map.player_hex)) {
      createProjectile(self.hex, g_map.player_hex, ANIM_ARC_HEIGHT * HEX_HEIGHT, 'rock');
      damagePlayer();
   } else {
      updatePathInfo(determineStartingHexes(MISSILE_MIN_DIST, 0, unavailableForGolem), false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Assassin throws bladed stars, but they can only be used when there are no
// creatures between assassin and the player, and the player is not too close.
//------------------------------------------------------------------------------
function createAssassin(hex) {
   return createEntity(hex, 'assassin', {
      max_health: ASSASSIN_HEALTH,
      can_attack: canAttackAssassin,
      think1: think1Assassin,
      think2: think2Assassin
   });
}

function unavailableForAssassin(hex, distance) {
   return (distance > ASSASSIN_RANGE || hex.creature);
}

function determineStartingHexesForAssassin(self) {
   self.hex.creature = null; // Ignore itself as an obstacle when thinking where to go.
   var starting_hexes = determineStartingHexes(MISSILE_MIN_DIST, 0, unavailableForAssassin);
   self.hex.creature = self;
   return starting_hexes;
}

function canAttackAssassin(self, target_hex) {
   self.dir = determineLineAttackDir(self.hex, target_hex, MISSILE_MIN_DIST, 0, unavailableForAssassin);
   return (self.dir != DIR_NULL);
}

function think1Assassin(self) {
   if (canAttackAssassin(self, g_map.player_hex)) {
      createProjectile(self.hex, g_map.player_hex, 0, 'star');
      damagePlayer();
      self.do_think2 = false;
   } else {
      self.do_think2 = true;
   }
}

function think2Assassin(self) {
   if (self.do_think2) {
      updatePathInfo(determineStartingHexesForAssassin(self), false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Shaman launches fireballs, but they can only be used when there are no
// creatures between shaman and the player, and the player is not too close.
// Shaman also periodically spawns skulls.
//------------------------------------------------------------------------------
function createShaman(hex) {
   var self = createEntity(hex, 'shaman', {
      max_health: SHAMAN_HEALTH,
      can_attack: canAttackShaman,
      think1: think1Shaman,
      think2: think2Shaman
   });
   self.count = 0;
   return self;
}

function unavailableForShaman(hex, distance) {
   return (distance > SHAMAN_RANGE || hex.creature);
}

function determineStartingHexesForShaman(self) {
   self.hex.creature = null; // Ignore itself as an obstacle when thinking where to go.
   var starting_hexes = determineStartingHexes(MISSILE_MIN_DIST, 0, unavailableForShaman);
   self.hex.creature = self;
   return starting_hexes;
}

function canAttackShaman(self, target_hex) {
   self.dir = determineLineAttackDir(self.hex, target_hex, MISSILE_MIN_DIST, 0, unavailableForShaman);
   return (self.dir != DIR_NULL);
}

function think1Shaman(self) {
   self.do_think2 = true;
   self.count -= 1;
   if (canAttackShaman(self, g_map.player_hex)) {
      createProjectile(self.hex, g_map.player_hex, 0, 'fireball');
      damagePlayer();
      self.do_think2 = false;
   } else if (self.count < 0) {
      // Don't spawn a skull if there is no path to the player, or the player is too close.
      if (determinePathDistance(self.hex, g_map.player_hex, true) >= SHAMAN_MIN_DIST) {
         activateCreature(createSkull(self.hex));
         self.count = SHAMAN_DELAY;
         self.do_think2 = false;
      }
   }
}

function think2Shaman(self) {
   if (self.do_think2) {
      updatePathInfo(determineStartingHexesForShaman(self), false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Demon creates a line of flames.
// The flames are only created if they do not result in hurting other creatures.
// Demon is immune to fire damage, and can walk through lava.
//------------------------------------------------------------------------------
function createDemon(hex) {
   return createEntity(hex, 'demon', {
      immunity_fire: true,
      max_health: DEMON_HEALTH,
      can_attack: canAttackDemon,
      think1: think1Demon,
      think2: think2Demon
   });
}

function unavailableForDemon(hex, distance) {
   return (distance > DEMON_RANGE || hex.creature);
}

function determineStartingHexesForDemon(self) {
   self.hex.creature = null; // Ignore itself as an obstacle when thinking where to go.
   var starting_hexes = determineStartingHexes(0, DEMON_RANGE, unavailableForDemon);
   self.hex.creature = self;
   return starting_hexes;
}

function canAttackDemon(self, target_hex) {
   self.dir = determineLineAttackDir(self.hex, target_hex, 0, DEMON_RANGE, unavailableForDemon);
   return (self.dir != DIR_NULL);
}

function damagePlayerForDemon(self) {
   if (canAttackDemon(self, g_map.player_hex)) {
      var dist = 1;
      for (var hex = self.hex.neighbors[self.dir]; hex; hex = hex.neighbors[self.dir]) {
         if (hex.kind == HEX_WALL || dist > DEMON_RANGE) {
            break;
         } else {
            var entity = createTemporaryEntity(hex, 'flames');
            entity.show_pos = (dist - 1) * 0.1;
            entity.hide_pos = 1.0 - ((DEMON_RANGE - dist) * 0.1);
            dist += 1;
         }
      }
      damagePlayer();
      return true;
   } else {
      return false;
   }
}

function think1Demon(self) {
   self.do_think2 = !damagePlayerForDemon(self);
}

function think2Demon(self) {
   if (self.do_think2) {
      updatePathInfo(determineStartingHexesForDemon(self), true);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Beast creates a lightning which travels over a given distance, and which
// can change its direction at any point. The lightning is only created if there
// is a path to the player that does not result in hurting other creatures.
// Beast is immune to lightning damage.
//------------------------------------------------------------------------------
function createBeast(hex) {
   return createEntity(hex, 'beast', {
      immunity_lightning: true,
      max_health: BEAST_HEALTH,
      can_attack: canAttackBeast,
      think1: think1Beast,
      think2: think2Beast
   });
}

function determineHexesForBeast(self, hexes, target_hex, distance) {
   if (distance > 0) {
      for (var i = 0; i < NUM_DIRS; i++) {
         var hex = hexes[hexes.length-1].neighbors[i];
         if (hex && hex.kind != HEX_WALL && !hex.creature) {
            if (!isHexPresentOnList(hex, hexes)) {
               if (!determineHexesForBeast(self, hexes.concat([hex]), target_hex, distance-1)) {
                  return false;
               }
            }
         }
      }
   } else {
      if (!target_hex) {
         var last_hex = hexes[hexes.length-1];
         if (!isHexPresentOnList(last_hex, self.starting_hexes)) {
            self.starting_hexes.push(last_hex);
         }
      } else if (isHexPresentOnList(target_hex, hexes)) {
         hexes.splice(0, 1); // Remove the first element (beast position).
         self.attack_hexes = hexes;
         return false; // Possible attack path found, no need for further searching.
      }
   }
   return true;
}

function determineStartingHexesForBeast(self) {
   self.starting_hexes = [];
   determineHexesForBeast(self, [g_map.player_hex], null, BEAST_RANGE);
   return self.starting_hexes;
}

function determineAttackHexesForBeast(self, target_hex) {
   self.attack_hexes = [];
   // Don't bother testing all possible paths if the player is too far away.
   if (isHexPresentOnList(target_hex, surroundingVisibleHexes(self.hex, BEAST_RANGE))) {
      determineHexesForBeast(self, [self.hex], target_hex, BEAST_RANGE);
   }
}

function canAttackBeast(self, target_hex) {
   determineAttackHexesForBeast(self, target_hex);
   return (self.attack_hexes.length > 0);
}

function damagePlayerForBeast(self) {
   if (canAttackBeast(self, g_map.player_hex)) {
      for (var i = 0; i < self.attack_hexes.length; i++) {
         var dist = i+1;
         var entity = createTemporaryEntity(self.attack_hexes[i], 'lightning');
         entity.show_pos = (dist - 1) * 0.1;
         entity.hide_pos = 1.0 - ((BEAST_RANGE - dist) * 0.1);
      }
      damagePlayer();
      return true;
   }
   return false;
}

function think1Beast(self) {
   self.do_think2 = !damagePlayerForBeast(self);
}

function think2Beast(self) {
   if (self.do_think2) {
      updatePathInfo(determineStartingHexesForBeast(self), false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Hybrid has abilities of both demon and beast,
// although it loses damage immunities of its cousins.
//------------------------------------------------------------------------------
function createHybrid(hex) {
   var self = createEntity(hex, 'hybrid', {
      max_health: HYBRID_HEALTH,
      can_attack: canAttackHybrid,
      think1: think1Hybrid,
      think2: think2Hybrid
   });
   self.behavior_phase = 'demon';
   return self;
}

function canAttackHybrid(self, target_hex) {
   return (canAttackDemon(self, target_hex) || canAttackBeast(self, target_hex));
}

function think1Hybrid(self) {
   self.do_think2 = true;
   if (self.behavior_phase == 'demon') {
      self.do_think2 = !damagePlayerForDemon(self);
      if (self.do_think2) {
         self.do_think2 = !damagePlayerForBeast(self);
         if (self.do_think2) {
            self.behavior_phase = 'beast';
         }
      } else {
         self.behavior_phase = 'beast';
      }
   } else {
      self.do_think2 = !damagePlayerForBeast(self);
      if (self.do_think2) {
         self.do_think2 = !damagePlayerForDemon(self);
         if (self.do_think2) {
            self.behavior_phase = 'demon';
         }
      } else {
         self.behavior_phase = 'demon';
      }
   }
}

function think2Hybrid(self) {
   if (self.do_think2) {
      // Starting hexagons for hybrid are a sum of starting hexagons for
      // demon and beast, with duplicates removed. Since hexagons are sorted
      // by their distance from the player, and demon has greater range,
      // it makes sense to put the beast hexagons last.
      var hexes_demon = determineStartingHexesForDemon(self);
      var hexes_beast = determineStartingHexesForBeast(self).filter(function (hex) {
         return !isHexPresentOnList(hex, hexes_demon);
      });
      var starting_hexes = hexes_demon.concat(hexes_beast);
      updatePathInfo(starting_hexes, false);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//------------------------------------------------------------------------------
// Skull moves significantly faster than other creatures. It can fly above lava.
// Upon reaching the player, skull triggers an explosion which occurs in the
// next round. Explosion affects nearby hexagons, and damages creatures standing
// on them. Explosion is also triggered when skull is killed by someone else.
//------------------------------------------------------------------------------
function createSkull(hex) {
   return createEntity(hex, 'skull', {
      max_health: SKULL_HEALTH, think1: think1Skull, think2: think2Skull, die: dieSkull
   });
}

function think1Skull(self) {
   if (areHexesNeighbors(self.hex, g_map.player_hex)) {
      killEntity(self);
   }
}

function think2Skull(self) {
   updatePathInfo([g_map.player_hex], true);
   for (var i = 0; i < SKULL_SPEED; i++) {
      creatureMove(self, pathInfoCameFrom(self.hex, true));
      if (areHexesNeighbors(self.hex, g_map.player_hex)) {
         self.suicide = true; // This will cause explosion in the next round.
         break;
      }
   }
}

function dieSkull(self) {
   var hexes = self.hex.neighbors.filter(function (hex) {
      return (hex && hex.kind != HEX_WALL);
   });
   hexes.push(self.hex);
   for (var i = 0; i < hexes.length; i++) {
      createTemporaryEntity(hexes[i], 'flames');
      if (hexes[i] === g_map.player_hex) {
         damagePlayer();
      } else {
         damageCreatureIfExists(hexes[i].creature, DAMAGE_FIRE, 1);
      }
   }
}

//------------------------------------------------------------------------------
// Create an object encapsulating a monologue, i.e. multiple paragraphs
// of text said by a creature. A single paragraph starts getting displayed
// if a creature enters talking range with the player, and ends getting
// displayed after a certain time.
//------------------------------------------------------------------------------
function createMonologue(monologue) {
   var messages = monologue;
   var count    = 0;
   var endtime  = 0;
   return {
      completed: function (current_time) {
         return ((endtime < current_time) && (count >= messages.length));
      },
      getMessage: function (current_time, in_talk_range) {
         if (endtime < current_time) {
            if (count < messages.length) {
               if (in_talk_range) {
                  count += 1;
                  endtime = current_time + DISPLAY_TEXT_TIME;
                  return messages[count-1];
               }
            }
         } else {
            return messages[count-1];
         }
         return null;
      },
      getLastMessage: function () {
         return messages[messages.length-1];
      },
   };
}

//------------------------------------------------------------------------------
// Zombie messenger says the given thing. That's its only purpose.
//------------------------------------------------------------------------------
function createZombieMsgr(hex, message) {
   var self = createEntity(hex, 'zombie', {max_health: ZOMB_MSGR_HEALTH, think2: thinkZombieMsgr});
   self.hide_healthbar = true;
   self.message_to_say = message;
   return self;
}

function thinkZombieMsgr(self) {
   if (isHexPresentOnList(self.hex, playerReachableHexes(TALK_DISTANCE))) {
      self.message = self.message_to_say;
   } else {
      self.message = null;
   }
}

//------------------------------------------------------------------------------
// Zombie sage provides some basic status information for the player.
// Zombie sage has special monologue for start and final maps.
//------------------------------------------------------------------------------
function createZombieSage(hex) {
   var self = createEntity(hex, 'zombie', {max_health: ZOMB_SAGE_HEALTH, think2: thinkZombieSage});
   self.hide_healthbar = true;
   // Check if we need to display special monologue.
   if (g_map.level == 0) {
      self.monologue = createMonologue(TEXT.START_MONOLOGUE);
   } else if (g_map.level == 10) {
      self.monologue = createMonologue(TEXT.FINAL_MONOLOGUE);
   } else {
      self.monologue = null;
   }
   return self;
}

function killCountsForZombie() {
   var str = '';
   var buf = [];
   var keys = Object.keys(TEXT.CREATURE_COUNT).sort();
   for (var i = 0; i < keys.length; i++) {
      var kill_count = g_player.statistics.kills[keys[i]];
      if (kill_count > 0) {
         var tmp = buf.join(', ');
         if (tmp.length > TALK_LINE_LENGTH) {
            str = str + tmp + ',\n';
            buf = [];
         }
         buf.push(TEXT.CREATURE_COUNT[keys[i]](kill_count));
      }
   }
   return (str + buf.join(', ') + '.');
}

function statusMessageForZombie() {
   var buf = [
      TEXT.DEPTH_STATUS(g_map.level),
      TEXT.DEATH_STATUS(g_player.statistics.deaths),
      TEXT.KILLS_STATUS(g_player.statistics.kills.total)
   ];
   if (g_player.statistics.kills.total > 0) {
      buf.push(killCountsForZombie());
   }
   return buf.join('\n');
}

function thinkZombieSage(self) {
   var current_time  = performance.now();
   var in_talk_range = isHexPresentOnList(self.hex, playerReachableHexes(TALK_DISTANCE));
   self.message      = null;
   // Display the monologue for start or final map.
   // Repeat the last part if the entire monologue have been already displayed.
   if (self.monologue) {
      if (!self.monologue.completed(current_time)) {
         self.message = self.monologue.getMessage(current_time, in_talk_range);
      } else if (in_talk_range) {
         self.message = self.monologue.getLastMessage();
      }
   } else if (in_talk_range) {
      self.message = statusMessageForZombie();
   }
}

//------------------------------------------------------------------------------
// Lilith is immortal. She can attack nearby hexagons, but mostly she just
// makes babies and talks. The only way to defeat her is to kill the required
// number of her children.
//------------------------------------------------------------------------------
function createLilith(hex) {
   var self = createEntity(hex, 'lilith', {
      immunity_physical:  true,
      immunity_magic:     true,
      immunity_fire:      true,
      immunity_lightning: true,
      can_attack:         canAttackLilith,
      think2:             thinkLilith
   });
   self.children   = [];
   self.welcome    = createMonologue(TEXT.LILITH_WELCOME);
   self.goodbye    = createMonologue(TEXT.LILITH_GOODBYE);
   self.waves_done = 0;
   self.doing_wave = false;
   return self;
}

var LILITH_DISTANCE  = 5; // Maximum distance for making children and throwing out one-liners.
var LILITH_BIRTH_CNT = 3; // Maximum number of children per birth.
var LILITH_MIN_CNT   = 2; // Number of alive children which triggers "wave" of making children.
var LILITH_MAX_CNT   = 6; // Number of alive children which stops "wave" of making children.
var LILITH_NUM_WAVES = 5; // Number of "waves" to perform.

function createDemonicCreature(hex) {
   // Beast, Demon, Hybrid, Vampire or Wraith.
   return createHostileCreature(hex, randomElement('BDHVW'));
}

function childbirthLilith(self) {
   var missing_count = (LILITH_MAX_CNT + g_difficulty) - self.children.length;
   var empty_hexes = self.hex.neighbors.filter(isHexEmptyGround);
   var count = Math.min(missing_count, empty_hexes.length, LILITH_BIRTH_CNT);
   if (count > 0) {
      for (var i = 0; i < count; i++) {
         var ix = randomIndex(empty_hexes);
         var hex = empty_hexes.splice(ix,1)[0]; // Remove random hexagon from the array.
         var child = createDemonicCreature(self.hex);
         self.children.push(child);
         creatureMove(child, hex);
         activateCreature(child);
      }
      createTemporaryEntity(self.hex, 'birth');
   }
   return count;
}

function disappearLilith(self) {
   var smite = createTemporaryEntity(self.hex, 'smite');
   smite.hide_pos = 1/3;
   killEntity(self);
   switchOpenAllGates();
}

function updateChildrenListForLilith(self) {
   self.children = self.children.filter(function (creature) {
      return !creature.dead;
   });
   return self.children.length;
}

function canAttackLilith(self, target_hex) {
   return areHexesNeighbors(self.hex, target_hex);
}

function thinkLilith(self) {
   var num_children  = updateChildrenListForLilith(self);
   var current_time  = performance.now();
   var in_talk_range = isHexPresentOnList(self.hex, playerReachableHexes(TALK_DISTANCE));
   var in_range      = isHexPresentOnList(self.hex, playerReachableHexes(LILITH_DISTANCE));
   var do_move       = false;
   self.message      = null;
   // Display the "welcome" message before the fight begins.
   if (!self.welcome.completed(current_time)) {
      self.message = self.welcome.getMessage(current_time, in_talk_range);
   // Display the "goodbye" message if too many children are killed.
   // Disappear when the goodbye message stops being displayed.
   } else if (self.waves_done >= LILITH_NUM_WAVES && num_children == 0) {
      if (!self.goodbye.completed(current_time)) {
         self.message = self.goodbye.getMessage(current_time, in_talk_range);
         if (!self.message) {
            do_move = true;
         }
      } else {
         disappearLilith(self);
      }
   // Attack the player if he happens to be too close.
   } else if (canAttackLilith(self, g_map.player_hex)) {
      creatureMeleeAttack(self, g_map.player_hex);
      damagePlayer();
      self.message = randomElement(TEXT.LILITH_LAUGH);
   // Move towards the player if he is not in fighting range.
   } else if (!in_range) {
      do_move = true;
   // If there are very few alive children, then start a "wave" of making children
   // provided that the maximum number of such "waves" have not been done yet.
   // Stop the "wave" of making children if there are enough alive children.
   } else if (self.waves_done < LILITH_NUM_WAVES && (num_children <= LILITH_MIN_CNT || self.doing_wave)) {
      self.doing_wave = true;
      var count = childbirthLilith(self);
      if (count > 0) {
         self.message = randomElement(TEXT.LILITH_BIRTH);
         if ((num_children + count) >= (LILITH_MAX_CNT + g_difficulty)) {
            self.doing_wave = false;
            self.waves_done += 1;
         }
      }
   // Move towards the player if he is not in talking range.
   } else if (!in_talk_range) {
      do_move = true;
   // If there is nothing else to do, then possibly say something.
   } else if (Math.random() < 1/5) {
      self.message = randomElement(TEXT.LILITH_TALK);
   }
   if (do_move) {
      updatePathInfo([g_map.player_hex], true);
      creatureMove(self, pathInfoCameFrom(self.hex, true));
   }
}

//==============================================================================
//    I N P U T    F U N C T I O N S
//==============================================================================

function lockInput() {
   g_inputlock = true;
   g_map.selected_hex = null;
   drawHighlight();
}

function unlockInput() {
   g_inputlock = false;
   updateSelectedHexagon();
   drawHighlight();
}

//------------------------------------------------------------------------------
// Select hexagon lying under the mouse cursor.
// Mouse position coordinates should be relative to the top-left of the canvas.
//------------------------------------------------------------------------------
function updateSelectedHexagon() {
   var x = g_mousepos.x;
   var y = g_mousepos.y;
   g_map.selected_hex = null;
   for (var i = 0; i < g_map.visible_floor.length && !g_map.selected_hex; i++) {
      var cur = g_map.visible_floor[i];
      if (x >= cur.view_x && x < cur.view_x + HEX_WIDTH &&
          y >= cur.view_y && y < cur.view_y + HEX_HEIGHT) {
         // We need additional check when the given coordinates point to the
         // upper or lower quarter of the hexagon rectangle. In such case the
         // coordinates correspond to either this hexagon or a nearby one.
         var a1 = HEX_HEIGHT / (HEX_WIDTH*2);
         var a2 = -a1;
         if (y < cur.view_y + HEX_HEIGHT/4) {
            var x_ = cur.view_x + HEX_WIDTH/2;
            var y_ = cur.view_y;
            var y1 = a1 * (x - x_) + y_;
            var y2 = a2 * (x - x_) + y_;
            if (y >= y1 && y >= y2) {
               g_map.selected_hex = cur;
            }
         } else if (y > cur.view_y + (HEX_HEIGHT*3)/4) {
            var x_ = cur.view_x + HEX_WIDTH/2;
            var y_ = cur.view_y + HEX_HEIGHT;
            var y1 = a1 * (x - x_) + y_;
            var y2 = a2 * (x - x_) + y_;
            if (y <= y1 && y <= y2) {
               g_map.selected_hex = cur;
            }
         } else {
            g_map.selected_hex = cur;
         }
      }
   }
}

function isMousePosInRect(rect) {
   var x = g_mousepos.x;
   var y = g_mousepos.y;
   return (x >= rect.left && y >= rect.top && x < rect.right && y < rect.bottom);
}

function checkButtonPressed() {
   var button_pressed = true;
   if (isMousePosInRect(g_hud.button_kick)) {
      g_hud.action = (g_hud.action != ACTION_KICK) ? ACTION_KICK : ACTION_DEFAULT;
   } else if (isMousePosInRect(g_hud.button_jump)) {
      g_hud.action = (g_hud.action != ACTION_JUMP) ? ACTION_JUMP : ACTION_DEFAULT;
   } else if (isMousePosInRect(g_hud.button_spell)) {
      g_hud.action = (g_hud.action != ACTION_SPELL) ? ACTION_SPELL : ACTION_DEFAULT;
   } else {
      button_pressed = false;
   }
   return button_pressed;
}

function processButtonPressed() {
   if (g_player.stamina >= STAMINA_POINT) {
      if      (g_hud.action == ACTION_DEFAULT) {g_map.reachable_hexes = [];}
      else if (g_hud.action == ACTION_KICK)    {g_map.reachable_hexes = playerReachableHexesForKick();}
      else if (g_hud.action == ACTION_JUMP)    {g_map.reachable_hexes = playerReachableHexesForJump();}
      else if (g_hud.action == ACTION_SPELL)   {g_map.reachable_hexes = playerReachableHexesForSpell();}
      // The highest kick skill allows to hit all nearby opponents.
      // Therefore there is no need to wait for the player to select
      // any target hexagon. Perform the kick right away.
      if (g_hud.action == ACTION_KICK && g_player.skills.kick >= 3) {
         performPlayerAction(g_map.reachable_hexes[0]);
      } else {
         drawHighlight();
         drawHUD();
      }
   } else {
      g_hud.action = ACTION_DEFAULT;
   }
}

function performPlayerAction(target_hex) {
   var action_done = false;
   if (g_hud.action == ACTION_DEFAULT) {
      if (!target_hex.creature) {
         playerWalk(target_hex);
         action_done = true;
      }
   } else if (isHexPresentOnList(target_hex, g_map.reachable_hexes)) {
      if      (g_hud.action == ACTION_KICK)  {playerKick (target_hex);}
      else if (g_hud.action == ACTION_JUMP)  {playerJump (target_hex);}
      else if (g_hud.action == ACTION_SPELL) {playerSpell(target_hex);}
      g_player.stamina -= STAMINA_POINT;
      g_hud.action = ACTION_DEFAULT;
      drawHUD();
      action_done = true;
   }
   if (action_done) {
      g_map.reachable_hexes = [];
      g_map.unsafe_hexes    = [];
      g_map.unsafe_creature = null;
      drawHighlight();
   }
   return action_done;
}

function updateUnsafeHexes(target_hex) {
   var creature = target_hex.creature;
   if (!creature || !creature.can_attack || creature === g_map.unsafe_creature) {
      g_map.unsafe_creature = null;
      g_map.unsafe_hexes = [];
   } else {
      g_map.unsafe_creature = creature;
      g_map.unsafe_hexes = g_map.visible_floor.filter(function (hex) {
         return creature.can_attack(creature, hex);
      });
   }
   drawHighlight();
}

//------------------------------------------------------------------------------
// Update mouse position coordinates based on the event data.
// Note that mouse coordinates are relative to the top-left of the canvas.
//------------------------------------------------------------------------------
function updateMousePos(evt) {
   var canvas = document.getElementById('layer1');
   var rect = canvas.getBoundingClientRect();
   g_mousepos.x = evt.clientX - rect.left;
   g_mousepos.y = evt.clientY - rect.top;
}

function mousemove(evt) {
   updateMousePos(evt);
   if (!g_inputlock) {
      updateSelectedHexagon();
      drawHighlight();
   }
}

function mouseclick(evt) {
   updateMousePos(evt);
   if (g_player.health <= 0) {
      g_player.message = null;
      resetPlayer();
      restartMap();
      drawTransitionScreen();
   } else if (g_hud.levelup) {
      g_hud.levelup.forEach(function (item) {
         if (item.func && isMousePosInRect(item.button)) {
            g_hud.levelup = null;
            g_player.message = item.message;
            item.func(); // This function can overwrite the message.
            drawHUD();
            unlockInput();
         }
      });
   } else if (!g_inputlock) {
      if (checkButtonPressed()) {
         processButtonPressed();
      } else if (g_map.selected_hex) {
         if (!performPlayerAction(g_map.selected_hex)) {
            updateUnsafeHexes(g_map.selected_hex);
         }
      }
   }
}

//==============================================================================
//    I N I T I A L I Z A T I O N    F U N C T I O N S
//==============================================================================

function initViewConstants() {
   var img = document.getElementById('ground');
   HEX_WIDTH         = img.width;
   HEX_HEIGHT        = img.height;
   VERT_HEX_DELTA    = (HEX_HEIGHT * 3) / 4;
   VERT_ENTITY_DELTA = (HEX_HEIGHT * 6) / 10;
   VIEW_WIDTH        = HEX_WIDTH * (SIGHT_DISTANCE * 2 + 1);
   VIEW_HEIGHT       = HEX_HEIGHT + VERT_HEX_DELTA * (SIGHT_DISTANCE * 2);
}

function initCanvasLayers() {
   var canvas_list = ['layer1', 'layer2', 'layer3', 'layer4'];
   for(var i = 0; i < canvas_list.length; i++) {
      var canvas = document.getElementById(canvas_list[i]);
      canvas.width  = VIEW_WIDTH;
      canvas.height = VIEW_HEIGHT;
   }
}

function initHUD() {
   g_hud = {
      action: ACTION_DEFAULT,
      levelup: null
   };
   g_hud.img_cancel = document.getElementById('hud_cancel');
   g_hud.img_heal   = document.getElementById('hud_heal');
   g_hud.img_heal0  = document.getElementById('hud_heal0');
   g_hud.img_heal1  = document.getElementById('hud_heal1');
   g_hud.img_jump   = document.getElementById('hud_jump');
   g_hud.img_jump0  = document.getElementById('hud_jump0');
   g_hud.img_kick   = document.getElementById('hud_kick');
   g_hud.img_kick0  = document.getElementById('hud_kick0');
   g_hud.img_spell  = document.getElementById('hud_spell');
   g_hud.img_spell0 = document.getElementById('hud_spell0');
   g_hud.img_stam   = document.getElementById('hud_stam');
   g_hud.img_stam0  = document.getElementById('hud_stam0');
   // Rectangles for action buttons (centered at the bottom of the screen).
   var start_x = VIEW_WIDTH/2 - g_hud.img_jump.width/2 - g_hud.img_kick.width;
   g_hud.button_kick = {
      left:   start_x,
      top:    VIEW_HEIGHT - g_hud.img_kick.height,
      right:  start_x + g_hud.img_kick.width,
      bottom: VIEW_HEIGHT
   };
   g_hud.button_jump = {
      left:   g_hud.button_kick.right,
      top:    VIEW_HEIGHT - g_hud.img_jump.height,
      right:  g_hud.button_kick.right + g_hud.img_jump.width,
      bottom: VIEW_HEIGHT
   };
   g_hud.button_spell = {
      left:   g_hud.button_jump.right,
      top:    VIEW_HEIGHT - g_hud.img_spell.height,
      right:  g_hud.button_jump.right + g_hud.img_spell.width,
      bottom: VIEW_HEIGHT
   };
}

function main() {
   initViewConstants();
   initCanvasLayers();
   initHUD();
   initPlayer();
   generateMap(0);
   drawMapFirstPass();
   // Events.
   document.onmousemove = mousemove;
   document.onclick = mouseclick;
}
