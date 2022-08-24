package db

import (
	_ "embed"
	"encoding/json"
	"strconv"

	"github.com/yahuian/gox/errorx"
)

//go:embed area.json
var data []byte

// Area 行政区域
type Area struct {
	ID     uint64  `gorm:"primaryKey" json:"id"`
	Name   string  `gorm:"index" json:"name"`
	Level  string  `json:"level"` // 等级：country, province, city, district
	AdCode string  `gorm:"index" json:"adcode"`
	Lng    float64 `json:"lng"`
	Lat    float64 `json:"lat"`
	Parent string  `json:"parent"` // 父亲的 adcode
}

func initArea() error {
	count, err := Count[Area]("")
	if err != nil {
		return errorx.Wrap(err)
	}
	if count != 0 {
		return nil
	}

	// https://gw.alipayobjects.com/os/alisis/geo-data-v0.1.2/administrative-data/area-list.json
	type Temp struct {
		Name   string  `json:"name"`
		Level  string  `json:"level"`
		AdCode any     `json:"adcode"`
		Lng    float64 `json:"lng"`
		Lat    float64 `json:"lat"`
		Parent int     `json:"parent"`
	}

	var list []Temp
	if err := json.Unmarshal(data, &list); err != nil {
		return errorx.Wrap(err)
	}

	areas := make([]Area, 0, len(list))
	for _, v := range list {
		area := Area{
			Name:   v.Name,
			Level:  v.Level,
			Lng:    v.Lng,
			Lat:    v.Lat,
			Parent: strconv.Itoa(v.Parent),
		}

		if i, ok := v.AdCode.(float64); ok {
			area.AdCode = strconv.Itoa(int(i))
		} else {
			area.AdCode = v.AdCode.(string)
		}

		areas = append(areas, area)
	}

	if err := Client().Create(areas).Error; err != nil {
		return errorx.WrapMsg("area", err)
	}

	return nil
}
