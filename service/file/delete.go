package file

import (
	"errors"
	"os"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
	"gorm.io/gorm"
)

// @Tags    文件
// @Summary 删除
// @Accept  json
// @Produce json
// @param   payload body     ctx.IDList true "request payload"
// @Success 200     {object} ctx.Response
// @Router  /file/delete [delete]
func Delete(c *ctx.Context) {
	param, err := c.GetIDList()
	if err != nil {
		c.BadRequest(err)
		return
	}

	for _, v := range param.IDS {
		res, err := db.GetOneByID[db.File](v)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.BadRequest(err)
				return
			}
			logx.Errorf("%+v", err)
			c.InternalErr(err)
			return
		}

		if err := db.DeleteByID[db.File](v); err != nil {
			logx.Errorf("%+v", err)
			c.InternalErr(err)
			return
		}

		if err := os.Remove(res.FilePath()); err != nil {
			logx.Errorf("%+v", err)
			c.InternalErr(err)
			return
		}
	}

	c.Success()
}
