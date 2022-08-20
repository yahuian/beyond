package db

import (
	"github.com/yahuian/gox/errorx"
)

func Create[T any](data *T) error {
	return Client().Create(data).Error
}

func GetOneByID[T any](id uint64) (T, error) {
	var data T
	res := Client().Where("id = ?", id).First(&data)
	if res.Error != nil {
		return data, errorx.Wrap(res.Error)
	}
	return data, nil
}

func GetOne[T any](query any, args ...any) (T, error) {
	var data T
	res := Client().Where(query, args...).First(&data)
	if res.Error != nil {
		return data, errorx.Wrap(res.Error)
	}
	return data, nil
}

type Option struct {
	Page  int
	Size  int
	Query any
	Args  []any
	Order string
}

func GetMany[T any](opt Option) ([]T, error) {
	var list []T
	offset := (opt.Page - 1) * opt.Size
	res := Client().Where(opt.Query, opt.Args...).Offset(offset).Limit(opt.Size).Order(opt.Order).Find(&list)
	if res.Error != nil {
		return nil, errorx.Wrap(res.Error)
	}
	return list, nil
}

func GetAll[T any](query any, args ...any) ([]T, error) {
	var list []T
	res := Client().Debug().Where(query, args...).Find(&list)
	if res.Error != nil {
		return nil, errorx.Wrap(res.Error)
	}
	return list, nil
}

func Count[T any](query any, args ...any) (int64, error) {
	var (
		data  T
		count int64
	)
	res := Client().Model(data).Where(query, args...).Count(&count)
	if res.Error != nil {
		return 0, errorx.Wrap(res.Error)
	}
	return count, nil
}

func UpdateAllByID[T any](id uint64, data *T) error {
	return UpdateAll(data, "id = ?", id)
}

// UpdateAll 更新所有字段，即使字段为零值
func UpdateAll[T any](data *T, query any, args ...any) error {
	res := Client().Where(query, args...).Save(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}

func UpdateByID[T any](id uint64, data *T) error {
	return Update(data, "id = ?", id)
}

// Update 仅更新非零值的字段
func Update[T any](data *T, query any, args ...any) error {
	res := Client().Where(query, args...).Updates(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}

func DeleteByID[T any](id ...uint64) error {
	var data T
	res := Client().Where("id IN ?", id).Delete(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}

func Delete[T any](query any, args ...any) error {
	var data T
	res := Client().Where(query, args...).Delete(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}
