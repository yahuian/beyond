package utils

import (
	"fmt"
	"strconv"
)

// Cent 四舍五入，精确到分
func Cent(value float64) float64 {
	val, _ := strconv.ParseFloat(fmt.Sprintf("%.2f", value), 64)
	return val
}
