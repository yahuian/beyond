export const DateQueryFormat = 'YYYY-MM-DD HH:mm:ss'
export const DateShowFormat = 'YYYY-MM-DD'

export function FormatDateQuery(moments) {
  if (moments === null) {
    return null
  }
  if (!Array.isArray(moments)) {
    return null
  }
  return [
    moments[0].hours(0).minutes(0).seconds(0).format(DateQueryFormat),
    moments[1].hours(23).minutes(59).seconds(59).format(DateQueryFormat)
  ]
}