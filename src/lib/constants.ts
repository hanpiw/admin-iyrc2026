export type SubCategory = {
  name: string
  levels: string[]
}

export type CategoryHierarchy = {
  name: string
  subCategories?: SubCategory[]
  levels?: string[]
}

export const LOMBA_HIERARCHY: Record<string, CategoryHierarchy> = {
  "Kinder Mission": {
    name: "Kinder Mission",
    levels: ["Junior A", "Junior B", "Junior C"]
  },
  "Brickspeed": {
    name: "Brickspeed",
    subCategories: [
      { name: "MRT", levels: ["Junior A", "Junior B", "Junior C", "Senior"] },
      { name: "Model", levels: ["Junior A", "Junior B", "Junior C", "Senior"] }
    ]
  },
  "2 On 2 Soccer": {
    name: "2 On 2 Soccer",
    levels: ["Open"]
  },
  "Coding Mission": {
    name: "Coding Mission",
    subCategories: [
      { name: "MRT", levels: ["Junior BC", "Senior"] },
      { name: "RACERO", levels: ["Junior BC", "Senior"] }
    ]
  },
  "AI Animation": {
    name: "AI Animation",
    levels: ["Junior BC", "Senior"]
  },
  "Creative": {
    name: "Creative",
    subCategories: [
      { name: "MRT", levels: ["Junior ABC", "Senior"] },
      { name: "Open", levels: ["Open"] },
      { name: "Online", levels: ["Open"] }
    ]
  },
  "Game Maker Kit": {
    name: "Game Maker Kit",
    levels: ["Open"]
  },
  "Drone Soccer": {
    name: "Drone Soccer",
    levels: ["Open"]
  },
  "Item Recycle": {
    name: "Item Recycle",
    levels: ["Junior BC", "Senior"]
  },
  "Robot Teather": {
    name: "Robot Teather",
    levels: ["Junior ABC", "Senior"]
  }
}
