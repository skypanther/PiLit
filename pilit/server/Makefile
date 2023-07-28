MAKEFLAGS += --no-builtin-rules

VENV := ${VIRTUAL_ENV}
TARGET_VENV := ${PWD}/venv


activatevenv := \
@if [ -z $(VENV) ] || [ $(VENV) != $(TARGET_VENV) ] ; then \
	source venv/bin/activate; \
fi

.PHONY: start
start:
	$(activatevenv) && uvicorn main:app --reload; \

.PHONY: run
run: start

.PHONY: test
test:
	@echo "Not implemented"
	# $(activatevenv) && python -m pytest -rfs $(path); \

