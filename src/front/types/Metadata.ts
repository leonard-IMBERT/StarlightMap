
type Metadata = {
  "flatten": number
  "row-number": number
  "bottom-offset": number,
  "vertical-step": number,
  "horizontal-step": number,
  "left-offset": Record<string, number>,
  "row-length": Record<string, number>,
  "special": Array<[number, number]>,
}

export default Metadata
