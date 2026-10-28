/** What a Vitem needs to be drawn, whatever list it comes from (tasks, wishlist items...). */
export interface VItemData {
  id: number
  text: string
  completed?: boolean
}
