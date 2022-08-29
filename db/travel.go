package db

import (
	"time"

	"github.com/yahuian/gox/errorx"
)

type Travel struct {
	ID        uint64    `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`  // 名称 Area.Name
	Level     string    `json:"level"` // 级别 Area.Level
	Note      string    `json:"note"`  // 备注
	CreatedAt time.Time `json:"created_at" gorm:"index"`
	Files     []File    `json:"files" gorm:"foreignKey:UsedID"` // 文件列表
}

// 以下的方法都涉及多表关联查询，如不需要获取多表数据，依旧使用 crud.go 中的方法即可

type TravelDao struct {
}

func NewTravelDao() *TravelDao {
	return &TravelDao{}
}

func (t TravelDao) GetMany(opt Option) ([]Travel, error) {
	var list []Travel

	offset := (opt.Page - 1) * opt.Size

	err := Client().Where(opt.Query, opt.Args...).Offset(offset).
		Limit(opt.Size).Order(opt.Order).Preload("Files").Find(&list).Error

	if err != nil {
		return nil, errorx.Wrap(err)
	}

	return list, nil
}

func (t TravelDao) Delete(query any, args ...any) error {
	// 删除 travel
	var list []Travel
	err := Client().Where(query, args...).Preload("Files").
		Find(&list).Error
	if err != nil {
		return errorx.Wrap(err)
	}

	if err := Delete[Travel](query, args...); err != nil {
		return errorx.Wrap(err)
	}

	// 删除关联的 files
	var files []uint64
	for _, v := range list {
		for _, v := range v.Files {
			files = append(files, v.ID)
		}
	}
	if err := NewFileDao().Delete("id IN ?", files); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}
