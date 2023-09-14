MAKEFLAGS += --no-builtin-rules

args = $(filter-out $@,$(MAKECMDGOALS))

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

# Database / Migration Recipes
.PHONY: db-migrate
db-migrate:
	# @docker-compose run pilit_app alembic upgrade head
	alembic upgrade head

.PHONY: db-downgrade
db-downgrade:
	# @docker-compose run pilit_app alembic downgrade -1
	alembic downgrade -1

.PHONY: db-create-migration
db-create-migration:
	# @docker-compose run pilit_app alembic revision --autogenerate -m "$(call args)"
	alembic revision --autogenerate -m "$(call args)"

# NOT YET IMPLEMENTED
# .PHONY: db-seed
# db-seed:
# 	@psql postgresql://postgres:password@localhost/pilitdb -f ./db_seed.sql

# .PHONY: build-test-runner
# build-test-runner:
# 	@echo "Checking for existing pilit_test container ..."
# 	@sh -c '[ -n "$$(docker image ls pilit_test:latest -q)" ] || \
# 	    { echo "Building container ...";docker-compose build test_runner -q; }'

# .PHONY: test
# test:
# 	@echo "Not implemented"
# 	# $(activatevenv) && python -m pytest -rfs $(path); \


# .PHONY: test
# test: build-test-runner
# 	@echo "Running the tests ..."
# 	@docker-compose run --rm test_runner sh run_tests.sh test "$(call args)"

# .PHONY: coverage-report
# coverage-report: build-test-runner
# 	@docker-compose run test_runner sh run_tests.sh report

# #### Leave this stuff here at the end
# Create some help output and set it to run if someone types just `make`
.PHONY: help
help:
		@echo
		@echo Usage: make \<target\> \<options\>
		@echo
		@echo Common Targets:
		@echo "   run -- Run the API"
		# @echo "   test -- Run the test suite"
		# @echo "   coverage-report -- Runs the tests, generates test coverage report"
		@echo
		@echo DB/Migration Targets:
		@echo "   db-migrate -- Run DB migrations \(update to newest\)"
		@echo "   db-downgrade -- Run the last downgrade DB migration"
		@echo "   db-create-migration <migration_name> -- Create a new Alembic migration"
		# @echo "   db-reset -- Reset the DB"
		# @echo "   db-seed -- Populate your local DB with dev data"
		@echo

.DEFAULT_GOAL=help
