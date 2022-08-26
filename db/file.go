package db

import (
	"io"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/yahuian/beyond/config"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/filex"
)

type File struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"comment:文件名" json:"name"`
	Size      int       `gorm:"comment:文件大小" json:"size"`
	CreatedAt time.Time `gorm:"index,comment:创建时间" json:"created_at"`
}

func StoreFile(data []byte, ext string) (File, error) {
	now := time.Now()

	f := File{
		Name:      strconv.Itoa(int(now.UnixNano())) + ext,
		Size:      len(data),
		CreatedAt: now,
	}

	dir := f.dir()

	exist, err := filex.Exist(dir)
	if err != nil {
		return File{}, errorx.Wrap(err)
	}
	if !exist {
		if err := os.Mkdir(dir, 0700); err != nil {
			return File{}, errorx.Wrap(err)
		}
	}

	if err := os.WriteFile(path.Join(dir, f.Name), data, 0600); err != nil {
		return File{}, errorx.Wrap(err)
	}

	if err := Create(&f); err != nil {
		return File{}, errorx.Wrap(err)
	}

	return f, nil
}

func (f *File) dir() string {
	return path.Join(config.Val.Setting.FileStorePath, f.CreatedAt.Format("2006-01-02"))
}

func (f *File) FilePath() string {
	return path.Join(f.dir(), f.Name)
}

func (f *File) ReadFile() ([]byte, error) {
	file, err := os.Open(f.FilePath())
	if err != nil {
		return nil, errorx.Wrap(err)
	}
	defer file.Close()

	return io.ReadAll(file)
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
