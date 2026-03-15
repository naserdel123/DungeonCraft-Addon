import { world, system, ItemStack, EffectTypes } from "@minecraft/server";

// ==================== DUNGEON CRAFT MAIN SCRIPT ====================

console.log("§6[DungeonCraft] §rSystem initialized!");

// ==================== ENTITY SPAWNING ====================
world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    
    if (entity.typeId === "dungeoncraft:dungeon_golem") {
        world.sendMessage(`§4⚠ A Dungeon Golem has awakened!`);
        entity.runCommand(`title @a[r=30] actionbar §cA powerful enemy approaches...`);
    }
    
    if (entity.typeId === "dungeoncraft:shadow_assassin") {
        entity.runCommand(`effect @s invisibility 2 0 true`);
    }
});

// ==================== ENTITY DEATH ====================
world.afterEvents.entityDie.subscribe((event) => {
    const deadEntity = event.deadEntity;
    const killer = event.damageSource?.damagingEntity;
    
    if (deadEntity.typeId === "dungeoncraft:dungeon_golem") {
        if (killer && killer.typeId === "minecraft:player") {
            killer.runCommand(`give @s dungeoncraft:ancient_coin 10`);
            killer.runCommand(`title @s actionbar §6+10 Ancient Coins!`);
            world.sendMessage(`§6${killer.name} §rdefeated a Dungeon Golem!`);
        }
    }
    
    if (deadEntity.typeId === "dungeoncraft:shadow_assassin") {
        if (killer && killer.typeId === "minecraft:player") {
            killer.runCommand(`effect @s speed 10 1 true`);
        }
    }
});

// ==================== ITEM USE ====================
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    
    if (item.typeId === "dungeoncraft:ancient_coin") {
        player.runCommand(`effect @s regeneration 5 1 true`);
        player.runCommand(`playsound random.orb @s ~ ~ ~ 1.0`);
        player.runCommand(`title @s actionbar §aHealing energy flows through you...`);
        
        // Consume one coin
        if (item.amount > 1) {
            item.amount--;
            player.getComponent("inventory").container.setItem(player.selectedSlot, item);
        } else {
            player.getComponent("inventory").container.setItem(player.selectedSlot, undefined);
        }
    }
});

// ==================== BLOCK INTERACTION ====================
world.afterEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const item = event.itemStack;
    
    if (block.typeId === "dungeoncraft:treasure_chest") {
        player.runCommand(`playsound random.chestopen @a ~ ~ ~ 1.0`);
        player.runCommand(`particle minecraft:happy_villager ~ ~1 ~`);
    }
});

// ==================== TICK EVENT - AMBIENCE ====================
let tickCounter = 0;
system.runInterval(() => {
    tickCounter++;
    
    // Every 5 seconds
    if (tickCounter % 100 === 0) {
        for (const player of world.getAllPlayers()) {
            const block = player.dimension.getBlock({
                x: Math.floor(player.location.x),
                y: Math.floor(player.location.y),
                z: Math.floor(player.location.z)
            });
            
            if (block && block.typeId === "dungeoncraft:dungeon_stone") {
                player.runCommand(`playsound ambient.cave @s ~ ~ ~ 0.3 0.8`);
            }
        }
    }
    
    // Every 10 seconds - check for nearby mobs
    if (tickCounter % 200 === 0) {
        for (const player of world.getAllPlayers()) {
            const nearbyMobs = player.dimension.getEntities({
                location: player.location,
                maxDistance: 20,
                type: "dungeoncraft:dungeon_golem"
            });
            
            if (nearbyMobs.length > 0) {
                player.runCommand(`effect @s darkness 5 0 true`);
            }
        }
    }
}, 1);

// ==================== CHAT COMMANDS ====================
world.beforeEvents.chatSend.subscribe((event) => {
    const player = event.sender;
    const message = event.message;
    
    if (message === "!dungeon help") {
        event.cancel = true;
        player.runCommand(`tellraw @s {"rawtext":[{"text":"§6=== DungeonCraft Commands ===\n§r!dungeon help - Show this help\n!dungeon spawn golem - Spawn Dungeon Golem\n!dungeon spawn assassin - Spawn Shadow Assassin\n!dungeon give coins - Give 50 Ancient Coins\n!dungeon kit - Give starter kit"}]}`);
    }
    
    if (message === "!dungeon spawn golem") {
        event.cancel = true;
        player.runCommand(`summon dungeoncraft:dungeon_golem ~ ~5 ~`);
        player.runCommand(`title @s actionbar §4Summoned Dungeon Golem!`);
    }
    
    if (message === "!dungeon spawn assassin") {
        event.cancel = true;
        player.runCommand(`summon dungeoncraft:shadow_assassin ~ ~3 ~`);
        player.runCommand(`title @s actionbar §8Summoned Shadow Assassin!`);
    }
    
    if (message === "!dungeon give coins") {
        event.cancel = true;
        player.runCommand(`give @s dungeoncraft:ancient_coin 50`);
        player.runCommand(`title @s actionbar §6+50 Ancient Coins!`);
    }
    
    if (message === "!dungeon kit") {
        event.cancel = true;
        player.runCommand(`give @s dungeoncraft:shadow_blade 1`);
        player.runCommand(`give @s dungeoncraft:healing_staff 1`);
        player.runCommand(`give @s dungeoncraft:ancient_coin 20`);
        player.runCommand(`give @s dungeoncraft:dungeon_key 5`);
        player.runCommand(`give @s dungeoncraft:magic_lantern 10`);
        player.runCommand(`title @s actionbar §aStarter kit received!`);
    }
});

// ==================== WORLD LOAD ====================
world.afterEvents.worldInitialize.subscribe(() => {
    console.log("§6[DungeonCraft] §rWorld initialized!");
    world.sendMessage("§6[DungeonCraft] §rAddon loaded successfully! Type !dungeon help for commands.");
});
