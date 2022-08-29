package db

import (
	"os"
	"path"
	"strconv"
	"time"

	"github.com/yahuian/beyond/config"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/filex"
)

type File struct {
	ID        uint64    `json:"id" gorm:"primaryKey"`
	UsedID    uint64    `json:"used_id" gorm:"index"` // 使用者 ID
	Name      string    `json:"name"`                 // 文件名
	Size      int       `json:"size"`                 // 大小
	CreatedAt time.Time `json:"created_at"`
}

type FileDao struct {
}

func NewFileDao() *FileDao {
	return &FileDao{}
}

func (f *FileDao) Create(data []byte, ext string) (File, error) {
	now := time.Now()

	file := File{
		Name:      strconv.Itoa(int(now.UnixNano())) + ext,
		Size:      len(data),
		CreatedAt: now,
	}

	dir := file.dir()

	exist, err := filex.Exist(dir)
	if err != nil {
		return File{}, errorx.Wrap(err)
	}
	if !exist {
		if err := os.Mkdir(dir, 0700); err != nil {
			return File{}, errorx.Wrap(err)
		}
	}

	if err := os.WriteFile(path.Join(dir, file.Name), data, 0600); err != nil {
		return File{}, errorx.Wrap(err)
	}

	if err := Create(&file); err != nil {
		return File{}, errorx.Wrap(err)
	}

	return file, nil
}

func (f *FileDao) Delete(query any, args ...any) error {
	files, err := GetAll[File](query, args...)
	if err != nil {
		return errorx.Wrap(err)
	}
	if err := Delete[File](query, args...); err != nil {
		return errorx.Wrap(err)
	}
	for _, v := range files {
		if err := os.Remove(v.Filepath()); err != nil {
			return errorx.Wrap(err)
		}
	}
	return nil
}

func (f *File) dir() string {
	return path.Join(config.Val.Setting.FileStorePath, f.CreatedAt.Format("2006-01"))
}

func (f *File) Filepath() string {
	return path.Join(f.dir(), f.Name)
}

func initFile() error {
	dir := config.Val.Setting.FileStorePath

	exist, err := filex.Exist(dir)
	if err != nil {
		return errorx.Wrap(err)
	}

	if !exist {
		if err := os.Mkdir(dir, 0700); err != nil {
			return errorx.Wrap(err)
		}
	}

	return nil
}
