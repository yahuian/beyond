#!/bin/bash

# set up git hooks
SRC=".github/.githooks/pre-commit"
DST=".git/hooks/pre-commit"
cp $SRC $DST
chmod u+x $DST

# install bin
go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.46.2
go install github.com/swaggo/swag/cmd/swag@v1.8.4
go install github.com/cosmtrek/air@v1.40.4