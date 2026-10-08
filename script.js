
const Game = {

  world: [
    ["sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky"],
    ["sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky"],
    ["sky", "sky", "leaves", "leaves", "leaves", "sky", "sky", "sky", "leaves", "leaves", "leaves", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky", "sky"],
    ["sky", "leaves", "leaves", "leaves", "leaves", "leaves", "sky", "leaves", "leaves", "leaves", "leaves", "leaves", "leaves", "leaves", "leaves", "sky", "sky", "sky", "sky", "sky"],
    ["sky", "leaves", "leaves", "tree", "leaves", "leaves", "sky", "leaves", "leaves", "tree", "leaves", "leaves", "leaves", "leaves", "leaves", "leaves", "sky", "sky", "sky", "sky"],
    ["sky", "sky", "sky", "tree", "sky", "sky", "sky", "stone", "sky", "tree", "sky", "leaves", "leaves", "tree", "leaves", "leaves", "sky", "cactus", "sky", "sky"],
    ["sky", "sky", "sky", "tree", "sky", "sky", "stone", "stone", "sky", "tree", "sky", "sky", "sky", "tree", "sky", "sky", "sky", "cactus", "sky", "cactus"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "sand", "sand", "sand", "sand", "sand"],
    ["dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "sand", "sand", "sand", "sand", "sand"],
    ["dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "dirt", "sand", "sand", "sand", "sand", "sand"],
    ["stone", "stone", "coal", "stone", "stone", "stone", "stone", "stone", "stone", "coal", "stone", "stone", "stone", "stone", "iron", "stone", "stone", "stone", "stone", "stone"],
    ["stone", "stone", "stone", "stone", "stone", "iron", "stone", "stone", "iron", "stone", "stone", "stone", "coal", "stone", "stone", "stone", "stone", "stone", "coal", "stone"],
  ],

  originalWorld: [],
  selectedTool: null,
  selectedItem: null,
  inventory: {
    tree: 0, leaves: 0, cactus: 0,
    stone: 0, coal: 0, iron: 0,
    dirt: 0, grass: 0, sand: 0
  },

  toolRules: {
    axe:     ["tree", "leaves", "cactus"],
    pickaxe: ["stone", "coal", "iron"],
    shovel:  ["dirt", "grass", "sand"]
  },

  animationMs: 300,

  init: function () {
 
    this.originalWorld = this.world.map(function (row) {
      return [...row];
    });

    this.bindEvents();
    this.renderWorld();
    this.renderInventory();
    this.renderToolbar();
  },


  bindEvents: function () {
    const self = this;

    document.getElementById("toolbar").addEventListener("click", function (event) {
      const button = event.target.closest(".tool");
      if (button) self.selectTool(button.dataset.tool);
    });


    document.getElementById("tiles").addEventListener("click", function (event) {
      const tile = event.target.closest(".tile");
      if (!tile) return;
      self.clickTile(Number(tile.dataset.row), Number(tile.dataset.col));
    });


    document.getElementById("inventory").addEventListener("click", function (event) {
      const slot = event.target.closest(".slot");
      if (slot) self.selectItem(slot.dataset.type);
    });


    document.getElementById("reset-btn").addEventListener("click", function () {
      self.resetWorld();
    });
  },

  renderWorld: function () {
    const container = document.getElementById("tiles");
    container.innerHTML = "";

    for (let row = 0; row < this.world.length; row++) {
      for (let col = 0; col < this.world[row].length; col++) {
        const tile = document.createElement("div");
        tile.classList.add("tile", "tile-" + this.world[row][col]);
        tile.dataset.row = row;
        tile.dataset.col = col;
        container.appendChild(tile);
      }
    }

    const world = document.getElementById("world");
    world.style.setProperty("--rows", this.world.length);
    world.style.setProperty("--cols", this.world[0].length);
  },

  renderInventory: function () {
    const slots = document.querySelectorAll("#inventory .slot");

    slots.forEach((slot) => {
      const type = slot.dataset.type;
      const amount = this.inventory[type];

      slot.querySelector(".count").textContent = amount;
      slot.classList.toggle("empty", amount === 0);
      slot.classList.toggle("selected", type === this.selectedItem);
    });
  },

  renderToolbar: function () {
    document.querySelectorAll("#toolbar .tool").forEach((button) => {
      button.classList.toggle("selected", button.dataset.tool === this.selectedTool);
    });
  },

  selectTool: function (tool) {
    this.selectedTool = tool;
    this.selectedItem = null;
    this.renderToolbar();
    this.renderInventory();
  },

  selectItem: function (type) {
    if (this.inventory[type] === 0) return;   

    this.selectedItem = type;
    this.selectedTool = null;
    this.renderToolbar();
    this.renderInventory();
  },

  clickTile: function (row, col) {
    const type = this.world[row][col];

    if (this.selectedItem) {
      this.placeFromInventory(row, col);
      return;
    }
    if (this.selectedTool) {
      if (type === "sky") return;           

      if (this.canRemove(this.selectedTool, type)) {
        this.removeTile(row, col);
      } else {
        this.flashWrong(row, col);
      }
    }
  },

  canRemove: function (tool, type) {
    return this.toolRules[tool].includes(type);
  },

  removeTile: function (row, col) {
    const type = this.world[row][col];
    const element = this.getTileElement(row, col);

    if (element.classList.contains("removing")) return;
    element.classList.add("removing");

    setTimeout(() => {
      this.world[row][col] = "sky";
      this.addToInventory(type);
      this.renderWorld();
    }, this.animationMs);
  },

  addToInventory: function (type) {
    this.inventory[type]++;
    this.renderInventory();
  },

  placeFromInventory: function (row, col) {
    if (this.world[row][col] !== "sky") {
      this.flashWrong(row, col);           
      return;
    }

    const type = this.selectedItem;
    this.world[row][col] = type;
    this.inventory[type]--;


    if (this.inventory[type] === 0) this.selectedItem = null;

    this.renderWorld();
    this.getTileElement(row, col).classList.add("placed");
    this.renderInventory();
  },

  resetWorld: function () {
    this.world = this.originalWorld.map(function (row) {
      return [...row];
    });

    for (const type in this.inventory) this.inventory[type] = 0;
    this.selectedTool = null;
    this.selectedItem = null;

    this.renderWorld();
    this.renderInventory();
    this.renderToolbar();
  },


  getTileElement: function (row, col) {
    return document.querySelector(
      '#tiles .tile[data-row="' + row + '"][data-col="' + col + '"]'
    );
  },


  flashWrong: function (row, col) {
    const element = this.getTileElement(row, col);
    element.classList.remove("wrong");
    void element.offsetWidth;                   // restart the animation
    element.classList.add("wrong");
    setTimeout(() => element.classList.remove("wrong"), this.animationMs);
  }
};

Game.init();
