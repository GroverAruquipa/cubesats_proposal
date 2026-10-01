FROM mcr.microsoft.com/devcontainers/python:1-3.11-bookworm

# LaTeX able to compile the report (TikZ, pgfplots, siunitx, booktabs).
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        texlive-latex-base texlive-latex-recommended texlive-latex-extra \
        texlive-pictures texlive-science texlive-fonts-recommended \
        cm-super latexmk \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt && rm /tmp/requirements.txt
