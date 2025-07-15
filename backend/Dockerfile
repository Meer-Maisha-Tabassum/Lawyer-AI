# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file into the container at /code
COPY ./requirements.txt /code/requirements.txt

# Install any needed packages specified in requirements.txt
# --no-cache-dir: Don't store the package index locally
# --upgrade pip: Ensure pip is up to date
RUN pip install --no-cache-dir --upgrade pip -r /code/requirements.txt

# Download NLP models during the build process
RUN python -m spacy download en_core_web_sm && \
    python -c "import nltk; nltk.download('punkt')"

# Copy the rest of the application's code into the container
COPY ./app /code/app

# Run uvicorn when the container launches
# 0.0.0.0 is necessary to be accessible from outside the container
# The port is determined by Cloud Run's $PORT env var, but we default to 9191
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9191", "--reload"]