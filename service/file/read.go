package file

import (
	"errors"
	"strconv"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
	"gorm.io/gorm"
)

// @Tags    文件
// @Summary 预览
// @Param   id query string false "file id"
// @Router  /file/read [get]
func Read(c *ctx.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		c.BadRequest(errors.New("id must be uint64 type"))
		return
	}

	res, err := db.GetOneByID[db.File](uint64(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.BadRequest(err)
			return
		}
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.File(res.Filepath())
}
