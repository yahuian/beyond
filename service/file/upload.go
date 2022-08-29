package file

import (
	"io"
	"mime/multipart"
	"path"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

// @Tags    文件
// @Summary 上传
// @Produce json
// @Accept  multipart/form-data
// @Param   file[] formData file true "file"
// @Success 200    {object} ctx.Response{data=[]db.File}
// @Router  /file/upload [post]
func Upload(c *ctx.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.BadRequest(err)
		return
	}
	files := form.File["file[]"]

	list := make([]db.File, 0, len(files))

	for _, file := range files {
		data, err := readAll(file)
		if err != nil {
			c.BadRequest(err)
			return
		}

		res, err := db.NewFileDao().Create(data, path.Ext(file.Filename))
		if err != nil {
			logx.Errorf("%+v", err)
			c.InternalErr(err)
			return
		}

		list = append(list, res)
	}

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: list,
	})
}

func readAll(f *multipart.FileHeader) ([]byte, error) {
	r, err := f.Open()
	if err != nil {
		return nil, errorx.Wrap(err)
	}
	defer r.Close()

	return io.ReadAll(r)
}
