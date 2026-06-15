---
Task ID: 1
Agent: Main
Task: Fix all critical issues - video playback, PDF viewer, admin user deletion, exam short answer questions

Work Log:
- Fixed auto-seed causing deleted users to come back: Modified page.tsx to use localStorage flag, and seed API to check for existing departments/courses before reseeding
- Replaced broken VIDEO_CHAPTERS (referencing non-existent MP4 files) with VIDEO_LESSONS that use product images, detailed transcripts, and YouTube embed support
- Added DOCUMENT_RESOURCES with 6 comprehensive PDF-like documents (Product Catalogue, Safe Box Manual, RFID Guide, Sales Playbook, Warranty Agreement, Quick Reference Card)
- Added Documents tab to Study Materials section with View and Download functionality
- Created new Video Lesson dialog showing product images, transcripts, and key takeaways
- Created new Document Viewer dialog with iframe-based HTML document rendering
- Expanded INBOUND_SALES_PRE short answer questions from 6 to 50
- Added new imports (Eye icon) for document viewer functionality

Stage Summary:
- Videos now display as interactive lessons with product images, full transcripts, and key takeaways instead of broken MP4 players
- PDFs are now available as inline HTML documents that can be viewed and downloaded
- Admin deleted users will no longer be auto-recreated on page refresh
- Short answer questions expanded to 50 for INBOUND_SALES_PRE exam stage
- All changes compile and the page loads successfully
