package db

import (
	"github.com/yahuian/gox/errorx"
)

func Create[T any](data *T) error {
	return client.Create(data).Error
}

func GetOneByID[T any](id uint64) (T, error) {
	var data T
	res := client.Where("id = ?", id).First(&data)
	if res.Error != nil {
		return data, errorx.Wrap(res.Error)
	}
	return data, nil
}

func GetOne[T any](query any, args ...any) (T, error) {
	var data T
	res := client.Where(query, args...).First(&data)
	if res.Error != nil {
		return data, errorx.Wrap(res.Error)
	}
	return data, nil
}

func GetMany[T any](page, size int, query any, args ...any) ([]T, error) {
	var list []T
	offset := (page - 1) * size
	res := client.Where(query, args...).Offset(offset).Limit(size).Order("id desc").Find(&list)
	if res.Error != nil {
		return nil, errorx.Wrap(res.Error)
	}
	return list, nil
}

func GetAll[T any](query any, args ...any) ([]T, error) {
	var list []T
	res := client.Where(query, args...).Find(&list)
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
	res := client.Model(data).Where(query, args...).Count(&count)
	if res.Error != nil {
		return 0, errorx.Wrap(res.Error)
	}
	return count, nil
}

func UpdateByID[T any](id uint64, data *T) error {
	res := client.Where("id = ?", id).Save(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}

func Update[T any](data *T, query any, args ...any) error {
	res := client.Where(query, args...).Save(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}

func DeleteByID[T any](id ...uint64) error {
	var data T
	res := client.Where("id IN ?", id).Delete(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}

func Delete[T any](query any, args ...any) error {
	var data T
	res := client.Where(query, args...).Delete(data)
	if res.Error != nil {
		return errorx.Wrap(res.Error)
	}
	return nil
}
