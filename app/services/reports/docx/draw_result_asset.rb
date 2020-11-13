# frozen_string_literal: true

module Reports::Docx::DrawResultAsset
  def draw_result_asset(subject, my_module)
    result = my_module.results.find_by(id: subject['id']['result_id'])
    return unless result

    asset = result.asset
    timestamp = asset.created_at
    asset_url = Rails.application.routes.url_helpers.asset_download_url(asset)
    color = @color
    @docx.p
    @docx.p do
      text result.name, italic: true
      text ' '
      link I18n.t('projects.reports.elements.download'), asset_url do
        italic true
      end
      text ' ' + I18n.t('search.index.archived'), color: color[:gray] if result.archived?
      text ' ' + I18n.t('projects.reports.elements.result_asset.file_name', file: asset.file_name)
      text ' ' + I18n.t('projects.reports.elements.result_asset.user_time',
                        user: result.user.full_name, timestamp: I18n.l(timestamp, format: :full)), color: color[:gray]
    end

    Reports::DocxRenderer.render_asset_image(@docx, asset) if asset.previewable? && !asset.list?

    subject['children'].each do |child|
      public_send("draw_#{child['type_of']}", child, result)
    end
  end
end
