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
    levels: ["Junior A", "Junior B", "Junior C", "Senior", "Open"]
  },
  "Coding Mission": {
    name: "Coding Mission",
    subCategories: [
      { name: "MRT", levels: ["Junior B", "Junior C", "Senior"] },
      { name: "RACERO", levels: ["Junior B", "Junior C", "Senior"] }
    ]
  },
  "AI Animation": {
    name: "AI Animation",
    levels: ["Junior B", "Junior C", "Senior"]
  },
  "Creative": {
    name: "Creative",
    subCategories: [
      { name: "MRT", levels: ["Junior A", "Junior B", "Junior C", "Senior"] },
      { name: "Open", levels: ["Junior A", "Junior B", "Junior C", "Senior", "Open"] },
      { name: "Online", levels: ["Junior A", "Junior B", "Junior C", "Senior", "Open"] }
    ]
  },
  "Game Maker Kit": {
    name: "Game Maker Kit",
    levels: ["Junior A", "Junior B", "Junior C", "Senior", "Open"]
  },
  "Drone Soccer": {
    name: "Drone Soccer",
    levels: ["Junior A", "Junior B", "Junior C", "Senior", "Open"]
  },
  "Item Recycle": {
    name: "Item Recycle",
    levels: ["Junior B", "Junior C", "Senior"]
  },
  "Robot Teather": {
    name: "Robot Teather",
    levels: ["Junior A", "Junior B", "Junior C", "Senior"]
  }
}
